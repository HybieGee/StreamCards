import { Hono } from 'hono'
import type { Env } from '../index'

export const ordersRoutes = new Hono<{ Bindings: Env }>()

ordersRoutes.get('/', async (c) => {
  try {
    const limit = Number(c.req.query('limit')) || 20
    const offset = Number(c.req.query('offset')) || 0
    const status = c.req.query('status') || 'active'

    const orders = await c.env.DB.prepare(`
      SELECT
        o.*,
        c.tier as card_tier,
        s.handle as streamer_handle,
        s.avatar_url as streamer_avatar
      FROM orders o
      JOIN mints m ON o.nft_mint = m.nft_mint
      JOIN cards c ON m.card_id = c.id
      JOIN streamers s ON c.streamer_id = s.id
      WHERE o.status = ?
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(status, limit, offset).all()

    return c.json({
      orders: orders.results,
      pagination: {
        limit,
        offset,
        total: orders.results?.length || 0
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return c.json({ error: 'Failed to fetch orders' }, 500)
  }
})

ordersRoutes.post('/', async (c) => {
  try {
    const { nft_mint, seller_pubkey, price_lamports } = await c.req.json()

    if (!nft_mint || !seller_pubkey || !price_lamports) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    const mint = await c.env.DB.prepare(`
      SELECT * FROM mints WHERE nft_mint = ? AND owner_pubkey = ?
    `).bind(nft_mint, seller_pubkey).first()

    if (!mint) {
      return c.json({ error: 'NFT not found or not owned by seller' }, 400)
    }

    const existingOrder = await c.env.DB.prepare(`
      SELECT * FROM orders WHERE nft_mint = ? AND status = 'active'
    `).bind(nft_mint).first()

    if (existingOrder) {
      return c.json({ error: 'NFT already has an active order' }, 400)
    }

    const orderId = crypto.randomUUID()

    await c.env.DB.prepare(`
      INSERT INTO orders (id, nft_mint, seller_pubkey, price_lamports, status)
      VALUES (?, ?, ?, ?, 'active')
    `).bind(orderId, nft_mint, seller_pubkey, price_lamports).run()

    const order = await c.env.DB.prepare(`
      SELECT * FROM orders WHERE id = ?
    `).bind(orderId).first()

    return c.json({ order }, 201)
  } catch (error) {
    console.error('Error creating order:', error)
    return c.json({ error: 'Failed to create order' }, 500)
  }
})

ordersRoutes.post('/:id/buy', async (c) => {
  try {
    const orderId = c.req.param('id')
    const { buyer_pubkey, transaction } = await c.req.json()

    if (!buyer_pubkey || !transaction) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    const order = await c.env.DB.prepare(`
      SELECT * FROM orders WHERE id = ? AND status = 'active'
    `).bind(orderId).first()

    if (!order) {
      return c.json({ error: 'Order not found or not active' }, 404)
    }

    const fillId = crypto.randomUUID()

    await c.env.DB.batch([
      c.env.DB.prepare(`
        INSERT INTO fills (id, order_id, buyer_pubkey, price_lamports)
        VALUES (?, ?, ?, ?)
      `).bind(fillId, orderId, buyer_pubkey, order.price_lamports),

      c.env.DB.prepare(`
        UPDATE orders SET status = 'filled' WHERE id = ?
      `).bind(orderId),

      c.env.DB.prepare(`
        UPDATE mints SET owner_pubkey = ? WHERE nft_mint = ?
      `).bind(buyer_pubkey, order.nft_mint)
    ])

    const fill = await c.env.DB.prepare(`
      SELECT * FROM fills WHERE id = ?
    `).bind(fillId).first()

    return c.json({ fill }, 201)
  } catch (error) {
    console.error('Error filling order:', error)
    return c.json({ error: 'Failed to fill order' }, 500)
  }
})

ordersRoutes.delete('/:id', async (c) => {
  try {
    const orderId = c.req.param('id')
    const { seller_pubkey } = await c.req.json()

    const order = await c.env.DB.prepare(`
      SELECT * FROM orders WHERE id = ? AND seller_pubkey = ? AND status = 'active'
    `).bind(orderId, seller_pubkey).first()

    if (!order) {
      return c.json({ error: 'Order not found or not owned by seller' }, 404)
    }

    await c.env.DB.prepare(`
      UPDATE orders SET status = 'cancelled' WHERE id = ?
    `).bind(orderId).run()

    return c.json({ success: true })
  } catch (error) {
    console.error('Error cancelling order:', error)
    return c.json({ error: 'Failed to cancel order' }, 500)
  }
})