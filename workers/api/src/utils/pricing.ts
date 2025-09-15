import type { Env } from '../index'
import { getSurgeMultiplier } from './surge'

interface PricingConfig {
  basePricesSOL: Record<string, number>
  capsSOL: { min: number; max: number }
  weights: {
    viewers: number
    gas24h: number
    donations24h: number
    demand: number
  }
  normalizers: {
    viewers: { p50: number; p90: number }
    gas24h: { p50: number; p90: number }
    donations24h: { p50: number; p90: number }
  }
  surge: {
    windowMin: number
    thresholdMints: number
    maxMultiplier: number
    cooldownMin: number
  }
}

export async function calculateDynamicPrice(env: Env, card: any): Promise<number> {
  try {
    const configSetting = await env.DB.prepare(`
      SELECT value FROM settings WHERE key = 'pricing_config'
    `).first()

    if (!configSetting) {
      throw new Error('Pricing config not found')
    }

    const config: PricingConfig = JSON.parse(configSetting.value)
    const tier = card.tier.toLowerCase()
    const basePriceSOL = config.basePricesSOL[tier] || config.basePricesSOL.bronze

    const performanceMultiplier = calculatePerformanceMultiplier(
      config,
      card.current_viewers || 0,
      card.gas_24h || 0,
      card.donations_24h || 0
    )

    const surgeMultiplier = await getSurgeMultiplier(env, card.id)

    const finalPriceSOL = basePriceSOL * performanceMultiplier * surgeMultiplier

    const clampedPriceSOL = Math.max(
      config.capsSOL.min,
      Math.min(config.capsSOL.max, finalPriceSOL)
    )

    return Math.floor(clampedPriceSOL * 1e9)
  } catch (error) {
    console.error('Error calculating dynamic price:', error)
    return 10000000
  }
}

function calculatePerformanceMultiplier(
  config: PricingConfig,
  viewers: number,
  gas24h: number,
  donations24h: number
): number {
  const normalizeMetric = (value: number, p50: number, p90: number): number => {
    if (value <= p50) return value / p50 * 0.5
    if (value <= p90) return 0.5 + ((value - p50) / (p90 - p50)) * 0.4
    return 0.9 + Math.min(0.1, (value - p90) / p90 * 0.1)
  }

  const normalizedViewers = normalizeMetric(
    viewers,
    config.normalizers.viewers.p50,
    config.normalizers.viewers.p90
  )

  const normalizedGas = normalizeMetric(
    gas24h,
    config.normalizers.gas24h.p50,
    config.normalizers.gas24h.p90
  )

  const normalizedDonations = normalizeMetric(
    donations24h,
    config.normalizers.donations24h.p50,
    config.normalizers.donations24h.p90
  )

  const demandMultiplier = 1.0

  return (
    normalizedViewers * config.weights.viewers +
    normalizedGas * config.weights.gas24h +
    normalizedDonations * config.weights.donations24h +
    demandMultiplier * config.weights.demand
  )
}


export async function createSignedQuote(
  env: Env,
  cardId: string,
  priceLamports: number
): Promise<{ id: string; signature: string; expires_at: number }> {
  const quoteId = crypto.randomUUID()
  const expiresAt = Math.floor(Date.now() / 1000) + 60

  const message = `${quoteId}:${cardId}:${priceLamports}:${expiresAt}`

  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const secretKey = encoder.encode(env.PRICE_QUOTE_SIGNING_SECRET || 'default-secret')

  const key = await crypto.subtle.importKey(
    'raw',
    secretKey,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, data)
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  await env.DB.prepare(`
    INSERT INTO price_quotes (id, card_id, price_lamports, signature, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(quoteId, cardId, priceLamports, signatureHex, expiresAt).run()

  return {
    id: quoteId,
    signature: signatureHex,
    expires_at: expiresAt
  }
}

export async function verifySignedQuote(
  env: Env,
  quoteId: string,
  cardId: string,
  priceLamports: number,
  signature: string
): Promise<boolean> {
  try {
    const quote = await env.DB.prepare(`
      SELECT * FROM price_quotes
      WHERE id = ? AND card_id = ? AND price_lamports = ?
    `).bind(quoteId, cardId, priceLamports).first()

    if (!quote) return false
    if (quote.expires_at <= Math.floor(Date.now() / 1000)) return false

    return quote.signature === signature
  } catch (error) {
    console.error('Error verifying quote:', error)
    return false
  }
}