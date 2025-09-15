import type { Env } from '../index'

export interface SurgeData {
  card_id: string
  recent_mints: number
  surge_multiplier: number
  window_start: number
  cooldown_until?: number
}

export async function updateSurgeMetrics(env: Env): Promise<void> {
  try {
    const configSetting = await env.DB.prepare(`
      SELECT value FROM settings WHERE key = 'pricing_config'
    `).first()

    if (!configSetting) {
      console.warn('No pricing config found for surge calculation')
      return
    }

    const config = JSON.parse(configSetting.value)
    const { surge } = config

    const windowStart = Math.floor(Date.now() / 1000) - (surge.windowMin * 60)

    const cardSurgeData = await env.DB.prepare(`
      SELECT
        card_id,
        COUNT(*) as mint_count
      FROM mint_activity
      WHERE minted_at > ?
      GROUP BY card_id
    `).bind(windowStart).all()

    for (const data of cardSurgeData.results || []) {
      const mintCount = data.mint_count as number
      const cardId = data.card_id as string

      if (mintCount >= surge.thresholdMints) {
        const multiplier = Math.min(
          1 + ((mintCount - surge.thresholdMints) / surge.thresholdMints) * (surge.maxMultiplier - 1),
          surge.maxMultiplier
        )

        await env.CACHE.put(
          `surge:${cardId}`,
          JSON.stringify({
            multiplier,
            expires_at: Math.floor(Date.now() / 1000) + (surge.cooldownMin * 60),
            mint_count: mintCount
          }),
          { expirationTtl: surge.cooldownMin * 60 }
        )

        console.log(`Surge activated for card ${cardId}: ${mintCount} mints, ${multiplier}x multiplier`)
      }
    }
  } catch (error) {
    console.error('Error updating surge metrics:', error)
  }
}

export async function getSurgeMultiplier(env: Env, cardId: string): Promise<number> {
  try {
    const surgeData = await env.CACHE.get(`surge:${cardId}`)
    if (!surgeData) return 1.0

    const data = JSON.parse(surgeData)
    const now = Math.floor(Date.now() / 1000)

    if (now > data.expires_at) {
      await env.CACHE.delete(`surge:${cardId}`)
      return 1.0
    }

    return data.multiplier || 1.0
  } catch (error) {
    console.error(`Error getting surge multiplier for ${cardId}:`, error)
    return 1.0
  }
}

export async function getAllActiveSurges(env: Env): Promise<SurgeData[]> {
  try {
    const surges: SurgeData[] = []

    const activeCards = await env.DB.prepare(`
      SELECT DISTINCT card_id FROM mint_activity
      WHERE minted_at > strftime('%s', 'now') - 3600
    `).all()

    for (const card of activeCards.results || []) {
      const cardId = card.card_id as string
      const multiplier = await getSurgeMultiplier(env, cardId)

      if (multiplier > 1.0) {
        const surgeData = await env.CACHE.get(`surge:${cardId}`)
        if (surgeData) {
          const data = JSON.parse(surgeData)
          surges.push({
            card_id: cardId,
            recent_mints: data.mint_count,
            surge_multiplier: multiplier,
            window_start: data.expires_at - (15 * 60),
            cooldown_until: data.expires_at
          })
        }
      }
    }

    return surges
  } catch (error) {
    console.error('Error getting active surges:', error)
    return []
  }
}