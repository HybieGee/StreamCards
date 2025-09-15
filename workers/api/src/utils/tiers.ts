import type { Env } from '../index'

export interface TierThreshold {
  tier: string
  min_viewers: number
  min_gas_24h: number
  min_donations_24h: number
}

export interface StreamerMetrics {
  streamer_id: string
  handle: string
  current_tier: string
  avg_viewers: number
  gas_24h: number
  donations_24h: number
  volume_24h: number
  holders: number
}

export const TIER_ORDER = ['bronze', 'silver', 'gold', 'diamond', 'mythic']

export async function getTierThresholds(env: Env): Promise<TierThreshold[]> {
  try {
    const thresholds = await env.DB.prepare(`
      SELECT * FROM thresholds ORDER BY
        CASE tier
          WHEN 'bronze' THEN 1
          WHEN 'silver' THEN 2
          WHEN 'gold' THEN 3
          WHEN 'diamond' THEN 4
          WHEN 'mythic' THEN 5
        END
    `).all()

    return thresholds.results as TierThreshold[]
  } catch (error) {
    console.error('Error fetching tier thresholds:', error)
    return []
  }
}

export function calculateEligibleTier(
  thresholds: TierThreshold[],
  metrics: Omit<StreamerMetrics, 'streamer_id' | 'handle' | 'current_tier'>
): string {
  let eligibleTier = 'bronze'

  for (const threshold of thresholds) {
    const meetsViewers = metrics.avg_viewers >= threshold.min_viewers
    const meetsGas = metrics.gas_24h >= threshold.min_gas_24h
    const meetsDonations = metrics.donations_24h >= threshold.min_donations_24h

    if (meetsViewers && meetsGas && meetsDonations) {
      eligibleTier = threshold.tier
    }
  }

  return eligibleTier
}

export function getTierIndex(tier: string): number {
  return TIER_ORDER.indexOf(tier.toLowerCase())
}

export function isUpgrade(currentTier: string, newTier: string): boolean {
  const currentIndex = getTierIndex(currentTier)
  const newIndex = getTierIndex(newTier)
  return newIndex > currentIndex
}

export function getTierBenefits(tier: string): string[] {
  const benefits: Record<string, string[]> = {
    bronze: [
      'Base card design',
      'Standard mint price',
      'Basic metadata'
    ],
    silver: [
      'Enhanced card effects',
      'Metallic finish',
      'Increased mint value',
      'Priority marketplace features'
    ],
    gold: [
      'Animated card backgrounds',
      'Foil treatment',
      'Higher resale value',
      'Special edition variants'
    ],
    diamond: [
      'Holographic effects',
      'Premium animations',
      'Exclusive marketplace access',
      'Limited edition status'
    ],
    mythic: [
      'Ultra-rare status',
      'Maximum visual effects',
      'Highest market value',
      'VIP community access',
      'Special streamer perks'
    ]
  }

  return benefits[tier.toLowerCase()] || benefits.bronze
}

export async function processStreamerUpgrades(env: Env): Promise<{
  processed: number
  upgraded: number
  errors: number
}> {
  let processed = 0
  let upgraded = 0
  let errors = 0

  try {
    const thresholds = await getTierThresholds(env)
    if (thresholds.length === 0) {
      console.warn('No tier thresholds found')
      return { processed: 0, upgraded: 0, errors: 1 }
    }

    const streamersToCheck = await env.DB.prepare(`
      SELECT
        s.id as streamer_id,
        s.handle,
        c.id as card_id,
        c.tier as current_tier,
        COALESCE(AVG(st.viewers), 0) as avg_viewers,
        COALESCE(SUM(st.gas_sol), 0) as gas_24h,
        COALESCE(SUM(st.donations_sol), 0) as donations_24h,
        COALESCE(SUM(st.volume_sol), 0) as volume_24h,
        COALESCE(MAX(st.holders), 0) as holders
      FROM streamers s
      JOIN cards c ON s.id = c.streamer_id
      LEFT JOIN streamer_stats st ON s.id = st.streamer_id
        AND st.ts > (strftime('%s', 'now') - 86400)
      WHERE s.is_approved = 1
      GROUP BY s.id, c.id
    `).all()

    for (const streamer of streamersToCheck.results || []) {
      try {
        processed++

        const eligibleTier = calculateEligibleTier(thresholds, {
          avg_viewers: streamer.avg_viewers,
          gas_24h: streamer.gas_24h,
          donations_24h: streamer.donations_24h,
          volume_24h: streamer.volume_24h,
          holders: streamer.holders
        })

        if (isUpgrade(streamer.current_tier, eligibleTier)) {
          await upgradeStreamerTier(env, streamer.card_id, eligibleTier)

          console.log(`Upgraded ${streamer.handle} from ${streamer.current_tier} to ${eligibleTier}`)
          upgraded++

          await env.CACHE.put(
            `tier_upgrade:${streamer.streamer_id}`,
            JSON.stringify({
              from: streamer.current_tier,
              to: eligibleTier,
              timestamp: Date.now(),
              metrics: {
                viewers: streamer.avg_viewers,
                gas: streamer.gas_24h,
                donations: streamer.donations_24h
              }
            }),
            { expirationTtl: 86400 }
          )
        }
      } catch (error) {
        console.error(`Error processing streamer ${streamer.handle}:`, error)
        errors++
      }
    }
  } catch (error) {
    console.error('Error in tier upgrade process:', error)
    errors++
  }

  return { processed, upgraded, errors }
}

async function upgradeStreamerTier(env: Env, cardId: string, newTier: string): Promise<void> {
  await env.DB.prepare(`
    UPDATE cards SET tier = ?, updated_at = strftime('%s', 'now')
    WHERE id = ?
  `).bind(newTier, cardId).run()
}

export async function getRecentUpgrades(env: Env, limit: number = 10): Promise<any[]> {
  try {
    const keys = await env.CACHE.list({ prefix: 'tier_upgrade:' })
    const upgrades = []

    for (const key of keys.keys.slice(0, limit)) {
      try {
        const data = await env.CACHE.get(key.name)
        if (data) {
          const upgrade = JSON.parse(data)
          const streamerId = key.name.replace('tier_upgrade:', '')

          const streamer = await env.DB.prepare(`
            SELECT handle FROM streamers WHERE id = ?
          `).bind(streamerId).first()

          upgrades.push({
            streamer_id: streamerId,
            handle: streamer?.handle || 'Unknown',
            ...upgrade
          })
        }
      } catch (error) {
        console.warn(`Error parsing upgrade data for ${key.name}:`, error)
      }
    }

    return upgrades.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error('Error fetching recent upgrades:', error)
    return []
  }
}