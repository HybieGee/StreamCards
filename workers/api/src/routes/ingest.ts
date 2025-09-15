import { Hono } from 'hono'
import type { Env } from '../index'

export const ingestRoutes = new Hono<{ Bindings: Env }>()

ingestRoutes.post('/', async (c) => {
  try {
    const signature = c.req.header('X-Helius-Signature')
    const body = await c.req.text()

    if (!signature) {
      return c.json({ error: 'Missing signature' }, 401)
    }

    const webhook = JSON.parse(body)

    if (!webhook.type || !webhook.source) {
      return c.json({ error: 'Invalid webhook format' }, 400)
    }

    await c.env.INGEST_QUEUE.send({
      type: 'WEBHOOK_DATA',
      data: webhook,
      timestamp: Date.now()
    })

    return c.json({ status: 'queued' })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return c.json({ error: 'Failed to process webhook' }, 500)
  }
})

ingestRoutes.post('/manual', async (c) => {
  try {
    const { streamers } = await c.req.json()

    if (!Array.isArray(streamers)) {
      return c.json({ error: 'Streamers must be an array' }, 400)
    }

    let created = 0
    let updated = 0

    for (const streamerData of streamers) {
      const { handle, token_ca, avatar_url, viewers, gas_sol, donations_sol } = streamerData

      if (!handle) continue

      let streamer = await c.env.DB.prepare(`
        SELECT * FROM streamers WHERE handle = ?
      `).bind(handle).first()

      if (!streamer) {
        const id = crypto.randomUUID()
        await c.env.DB.prepare(`
          INSERT INTO streamers (id, handle, token_ca, avatar_url, is_approved)
          VALUES (?, ?, ?, ?, 1)
        `).bind(id, handle, token_ca, avatar_url).run()

        await c.env.DB.prepare(`
          INSERT INTO cards (id, streamer_id, tier, mint_price_lamports)
          VALUES (?, ?, 'bronze', 10000000)
        `).bind(crypto.randomUUID(), id).run()

        created++
        streamer = { id }
      } else {
        updated++
      }

      if (viewers !== undefined || gas_sol !== undefined || donations_sol !== undefined) {
        await c.env.DB.prepare(`
          INSERT INTO streamer_stats (streamer_id, viewers, gas_sol, donations_sol)
          VALUES (?, ?, ?, ?)
        `).bind(
          streamer.id,
          viewers || 0,
          gas_sol || 0,
          donations_sol || 0
        ).run()
      }
    }

    return c.json({
      processed: streamers.length,
      created,
      updated
    })
  } catch (error) {
    console.error('Error processing manual ingest:', error)
    return c.json({ error: 'Failed to process manual ingest' }, 500)
  }
})