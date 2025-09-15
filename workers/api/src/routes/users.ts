import { Hono } from 'hono'
import type { Env } from '../index'

export const usersRoutes = new Hono<{ Bindings: Env }>()

usersRoutes.get('/:pubkey/mints', async (c) => {
  try {
    const pubkey = c.req.param('pubkey')

    if (!pubkey) {
      return c.json({ error: 'Public key is required' }, 400)
    }

    const mints = await c.env.DB.prepare(`
      SELECT
        m.*,
        c.tier,
        s.handle as streamer_handle,
        s.avatar_url as streamer_avatar
      FROM mints m
      JOIN cards c ON m.card_id = c.id
      JOIN streamers s ON c.streamer_id = s.id
      WHERE m.owner_pubkey = ?
      ORDER BY m.created_at DESC
    `).bind(pubkey).all()

    const enrichedMints = (mints.results || []).map((mint: any) => ({
      ...mint,
      card: {
        id: mint.card_id,
        tier: mint.tier,
        streamer_handle: mint.streamer_handle,
        streamer_avatar: mint.streamer_avatar
      }
    }))

    return c.json({ mints: enrichedMints })
  } catch (error) {
    console.error('Error fetching user mints:', error)
    return c.json({ error: 'Failed to fetch user mints' }, 500)
  }
})

usersRoutes.get('/:pubkey/stats', async (c) => {
  try {
    const pubkey = c.req.param('pubkey')

    if (!pubkey) {
      return c.json({ error: 'Public key is required' }, 400)
    }

    const stats = await c.env.DB.prepare(`
      SELECT
        COUNT(*) as total_mints,
        COUNT(DISTINCT c.streamer_id) as unique_streamers,
        COUNT(CASE WHEN c.tier = 'bronze' THEN 1 END) as bronze_count,
        COUNT(CASE WHEN c.tier = 'silver' THEN 1 END) as silver_count,
        COUNT(CASE WHEN c.tier = 'gold' THEN 1 END) as gold_count,
        COUNT(CASE WHEN c.tier = 'diamond' THEN 1 END) as diamond_count,
        COUNT(CASE WHEN c.tier = 'mythic' THEN 1 END) as mythic_count
      FROM mints m
      JOIN cards c ON m.card_id = c.id
      WHERE m.owner_pubkey = ?
    `).bind(pubkey).first()

    const activeOrders = await c.env.DB.prepare(`
      SELECT COUNT(*) as active_orders
      FROM orders o
      JOIN mints m ON o.nft_mint = m.nft_mint
      WHERE m.owner_pubkey = ? AND o.status = 'active'
    `).bind(pubkey).first()

    return c.json({
      stats: {
        ...stats,
        active_orders: activeOrders?.active_orders || 0
      }
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return c.json({ error: 'Failed to fetch user stats' }, 500)
  }
})