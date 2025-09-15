import { Hono } from 'hono'
import type { Env } from '../index'
import { ProviderManager } from '../providers/manager'
import { getAllActiveSurges } from '../utils/surge'
import { getRecentUpgrades, getTierBenefits, processStreamerUpgrades } from '../utils/tiers'

export const adminRoutes = new Hono<{ Bindings: Env }>()

adminRoutes.get('/streamers', async (c) => {
  try {
    const status = c.req.query('status') || 'pending'
    const isApproved = status === 'approved' ? 1 : 0

    const streamers = await c.env.DB.prepare(`
      SELECT
        s.*,
        COALESCE(AVG(st.viewers), 0) as avg_viewers,
        COALESCE(SUM(st.gas_sol), 0) as gas_24h,
        COALESCE(SUM(st.donations_sol), 0) as donations_24h
      FROM streamers s
      LEFT JOIN streamer_stats st ON s.id = st.streamer_id
        AND st.ts > (strftime('%s', 'now') - 86400)
      WHERE s.is_approved = ?
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `).bind(isApproved).all()

    return c.json({ streamers: streamers.results })
  } catch (error) {
    console.error('Error fetching admin streamers:', error)
    return c.json({ error: 'Failed to fetch streamers' }, 500)
  }
})

adminRoutes.put('/streamers/:id/approve', async (c) => {
  try {
    const id = c.req.param('id')

    await c.env.DB.prepare(`
      UPDATE streamers SET is_approved = 1 WHERE id = ?
    `).bind(id).run()

    const existingCard = await c.env.DB.prepare(`
      SELECT * FROM cards WHERE streamer_id = ?
    `).bind(id).first()

    if (!existingCard) {
      await c.env.DB.prepare(`
        INSERT INTO cards (id, streamer_id, tier, mint_price_lamports)
        VALUES (?, ?, 'bronze', 10000000)
      `).bind(crypto.randomUUID(), id).run()
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Error approving streamer:', error)
    return c.json({ error: 'Failed to approve streamer' }, 500)
  }
})

adminRoutes.delete('/streamers/:id', async (c) => {
  try {
    const id = c.req.param('id')

    await c.env.DB.batch([
      c.env.DB.prepare(`DELETE FROM streamer_stats WHERE streamer_id = ?`).bind(id),
      c.env.DB.prepare(`DELETE FROM cards WHERE streamer_id = ?`).bind(id),
      c.env.DB.prepare(`DELETE FROM streamers WHERE id = ?`).bind(id)
    ])

    return c.json({ success: true })
  } catch (error) {
    console.error('Error deleting streamer:', error)
    return c.json({ error: 'Failed to delete streamer' }, 500)
  }
})

adminRoutes.get('/settings', async (c) => {
  try {
    const settings = await c.env.DB.prepare(`
      SELECT * FROM settings
    `).all()

    const settingsObj: Record<string, any> = {}
    for (const setting of settings.results || []) {
      try {
        settingsObj[setting.key] = JSON.parse(setting.value)
      } catch {
        settingsObj[setting.key] = setting.value
      }
    }

    return c.json({ settings: settingsObj })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return c.json({ error: 'Failed to fetch settings' }, 500)
  }
})

adminRoutes.put('/settings/:key', async (c) => {
  try {
    const key = c.req.param('key')
    const { value } = await c.req.json()

    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value)

    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO settings (key, value)
      VALUES (?, ?)
    `).bind(key, serializedValue).run()

    return c.json({ success: true })
  } catch (error) {
    console.error('Error updating setting:', error)
    return c.json({ error: 'Failed to update setting' }, 500)
  }
})

adminRoutes.get('/thresholds', async (c) => {
  try {
    const thresholds = await c.env.DB.prepare(`
      SELECT * FROM thresholds ORDER BY
        CASE tier
          WHEN 'bronze' THEN 1
          WHEN 'silver' THEN 2
          WHEN 'gold' THEN 3
          WHEN 'diamond' THEN 4
          WHEN 'mythic' THEN 5
        END
    `).all()

    return c.json({ thresholds: thresholds.results })
  } catch (error) {
    console.error('Error fetching thresholds:', error)
    return c.json({ error: 'Failed to fetch thresholds' }, 500)
  }
})

adminRoutes.put('/thresholds/:tier', async (c) => {
  try {
    const tier = c.req.param('tier')
    const { min_viewers, min_gas_24h, min_donations_24h } = await c.req.json()

    await c.env.DB.prepare(`
      UPDATE thresholds
      SET min_viewers = ?, min_gas_24h = ?, min_donations_24h = ?
      WHERE tier = ?
    `).bind(min_viewers, min_gas_24h, min_donations_24h, tier).run()

    return c.json({ success: true })
  } catch (error) {
    console.error('Error updating threshold:', error)
    return c.json({ error: 'Failed to update threshold' }, 500)
  }
})

adminRoutes.get('/providers', async (c) => {
  try {
    const providerManager = new ProviderManager(c.env)
    const providers = providerManager.getProviderStatus()

    return c.json({ providers })
  } catch (error) {
    console.error('Error fetching provider status:', error)
    return c.json({ error: 'Failed to fetch provider status' }, 500)
  }
})

adminRoutes.post('/discovery/trigger', async (c) => {
  try {
    const providerManager = new ProviderManager(c.env)
    const discoveredStreamers = await providerManager.discoverStreamers()

    let processed = 0
    let created = 0
    let updated = 0

    for (const streamerData of discoveredStreamers) {
      try {
        let streamer = await c.env.DB.prepare(`
          SELECT * FROM streamers WHERE handle = ? OR token_ca = ?
        `).bind(streamerData.handle, streamerData.token_ca || '').first()

        if (!streamer) {
          const id = crypto.randomUUID()
          await c.env.DB.prepare(`
            INSERT INTO streamers (id, handle, token_ca, avatar_url, is_approved)
            VALUES (?, ?, ?, ?, 0)
          `).bind(id, streamerData.handle, streamerData.token_ca, streamerData.avatar_url).run()

          created++
          streamer = { id }
        } else {
          if (streamerData.avatar_url && !streamer.avatar_url) {
            await c.env.DB.prepare(`
              UPDATE streamers SET avatar_url = ? WHERE id = ?
            `).bind(streamerData.avatar_url, streamer.id).run()
          }
          updated++
        }

        await c.env.DB.prepare(`
          INSERT INTO streamer_stats (streamer_id, viewers, gas_sol, donations_sol, volume_sol, holders)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          streamer.id,
          streamerData.viewers,
          streamerData.gas_sol,
          streamerData.donations_sol,
          streamerData.volume_sol,
          streamerData.holders
        ).run()

        processed++
      } catch (error) {
        console.warn(`Error processing streamer ${streamerData.handle}:`, error)
      }
    }

    return c.json({
      success: true,
      discovered: discoveredStreamers.length,
      processed,
      created,
      updated
    })
  } catch (error) {
    console.error('Error triggering discovery:', error)
    return c.json({ error: 'Failed to trigger discovery' }, 500)
  }
})

adminRoutes.get('/surge', async (c) => {
  try {
    const activeSurges = await getAllActiveSurges(c.env)

    return c.json({ surges: activeSurges })
  } catch (error) {
    console.error('Error fetching surge data:', error)
    return c.json({ error: 'Failed to fetch surge data' }, 500)
  }
})

adminRoutes.get('/upgrades', async (c) => {
  try {
    const limit = Number(c.req.query('limit')) || 20
    const recentUpgrades = await getRecentUpgrades(c.env, limit)

    return c.json({ upgrades: recentUpgrades })
  } catch (error) {
    console.error('Error fetching upgrade history:', error)
    return c.json({ error: 'Failed to fetch upgrade history' }, 500)
  }
})

adminRoutes.post('/upgrades/trigger', async (c) => {
  try {
    const results = await processStreamerUpgrades(c.env)

    return c.json({
      success: true,
      results
    })
  } catch (error) {
    console.error('Error triggering tier upgrades:', error)
    return c.json({ error: 'Failed to trigger tier upgrades' }, 500)
  }
})

adminRoutes.get('/tiers/:tier/benefits', async (c) => {
  try {
    const tier = c.req.param('tier')
    const benefits = getTierBenefits(tier)

    return c.json({ tier, benefits })
  } catch (error) {
    console.error('Error fetching tier benefits:', error)
    return c.json({ error: 'Failed to fetch tier benefits' }, 500)
  }
})