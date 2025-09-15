import { Hono } from 'hono'
import type { Env } from '../index'
import { calculateDynamicPrice, createSignedQuote } from '../utils/pricing'

export const cardsRoutes = new Hono<{ Bindings: Env }>()

cardsRoutes.get('/', async (c) => {
  try {
    const limit = Number(c.req.query('limit')) || 20
    const offset = Number(c.req.query('offset')) || 0
    const tier = c.req.query('tier')

    let query = `
      SELECT
        c.*,
        s.handle as streamer_handle,
        s.avatar_url as streamer_avatar,
        COALESCE(AVG(st.viewers), 0) as current_viewers,
        COALESCE(SUM(st.gas_sol), 0) as gas_24h,
        COALESCE(SUM(st.donations_sol), 0) as donations_24h
      FROM cards c
      JOIN streamers s ON c.streamer_id = s.id
      LEFT JOIN streamer_stats st ON s.id = st.streamer_id
        AND st.ts > (strftime('%s', 'now') - 86400)
      WHERE s.is_approved = 1
    `

    const params: any[] = []

    if (tier) {
      query += ` AND c.tier = ?`
      params.push(tier)
    }

    query += `
      GROUP BY c.id
      ORDER BY c.updated_at DESC
      LIMIT ? OFFSET ?
    `

    params.push(limit, offset)

    const cards = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({
      cards: cards.results,
      pagination: {
        limit,
        offset,
        total: cards.results?.length || 0
      }
    })
  } catch (error) {
    console.error('Error fetching cards:', error)
    return c.json({ error: 'Failed to fetch cards' }, 500)
  }
})

cardsRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')

    const card = await c.env.DB.prepare(`
      SELECT
        c.*,
        s.handle as streamer_handle,
        s.avatar_url as streamer_avatar,
        COALESCE(AVG(st.viewers), 0) as current_viewers,
        COALESCE(SUM(st.gas_sol), 0) as gas_24h,
        COALESCE(SUM(st.donations_sol), 0) as donations_24h
      FROM cards c
      JOIN streamers s ON c.streamer_id = s.id
      LEFT JOIN streamer_stats st ON s.id = st.streamer_id
        AND st.ts > (strftime('%s', 'now') - 86400)
      WHERE c.id = ?
      GROUP BY c.id
    `).bind(id).first()

    if (!card) {
      return c.json({ error: 'Card not found' }, 404)
    }

    const currentPrice = await calculateDynamicPrice(c.env, card)

    return c.json({
      card: {
        ...card,
        current_price_lamports: currentPrice
      }
    })
  } catch (error) {
    console.error('Error fetching card:', error)
    return c.json({ error: 'Failed to fetch card' }, 500)
  }
})

cardsRoutes.get('/:id/quote', async (c) => {
  try {
    const id = c.req.param('id')

    const card = await c.env.DB.prepare(`
      SELECT
        c.*,
        s.handle as streamer_handle,
        COALESCE(AVG(st.viewers), 0) as current_viewers,
        COALESCE(SUM(st.gas_sol), 0) as gas_24h,
        COALESCE(SUM(st.donations_sol), 0) as donations_24h
      FROM cards c
      JOIN streamers s ON c.streamer_id = s.id
      LEFT JOIN streamer_stats st ON s.id = st.streamer_id
        AND st.ts > (strftime('%s', 'now') - 86400)
      WHERE c.id = ?
      GROUP BY c.id
    `).bind(id).first()

    if (!card) {
      return c.json({ error: 'Card not found' }, 404)
    }

    const price = await calculateDynamicPrice(c.env, card)
    const quote = await createSignedQuote(c.env, id, price)

    return c.json({
      quote_id: quote.id,
      card_id: id,
      price_lamports: price,
      signature: quote.signature,
      expires_at: quote.expires_at,
      valid_for_seconds: 60
    })
  } catch (error) {
    console.error('Error creating price quote:', error)
    return c.json({ error: 'Failed to create price quote' }, 500)
  }
})

cardsRoutes.post('/:id/mint', async (c) => {
  try {
    const id = c.req.param('id')
    const { quote_id, wallet_pubkey, transaction } = await c.req.json()

    if (!quote_id || !wallet_pubkey || !transaction) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    const quote = await c.env.DB.prepare(`
      SELECT * FROM price_quotes
      WHERE id = ? AND card_id = ? AND expires_at > strftime('%s', 'now')
    `).bind(quote_id, id).first()

    if (!quote) {
      return c.json({ error: 'Invalid or expired quote' }, 400)
    }

    const mintId = crypto.randomUUID()
    const nftMint = crypto.randomUUID()

    await c.env.DB.prepare(`
      INSERT INTO mints (id, card_id, nft_mint, owner_pubkey)
      VALUES (?, ?, ?, ?)
    `).bind(mintId, id, nftMint, wallet_pubkey).run()

    await c.env.DB.prepare(`
      UPDATE cards SET supply = supply + 1 WHERE id = ?
    `).bind(id).run()

    await c.env.DB.prepare(`
      INSERT INTO mint_activity (card_id) VALUES (?)
    `).bind(id).run()

    return c.json({
      mint: {
        id: mintId,
        nft_mint: nftMint,
        card_id: id,
        owner_pubkey: wallet_pubkey,
        transaction: transaction
      }
    }, 201)
  } catch (error) {
    console.error('Error minting card:', error)
    return c.json({ error: 'Failed to mint card' }, 500)
  }
})