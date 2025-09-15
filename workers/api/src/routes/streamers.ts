import { Hono } from 'hono'
import type { Env } from '../index'

export const streamersRoutes = new Hono<{ Bindings: Env }>()

streamersRoutes.get('/', async (c) => {
  try {
    const limit = Number(c.req.query('limit')) || 20
    const offset = Number(c.req.query('offset')) || 0

    const streamers = await c.env.DB.prepare(`
      SELECT
        s.*,
        COALESCE(AVG(st.viewers), 0) as avg_viewers,
        COALESCE(SUM(st.gas_sol), 0) as gas_24h,
        COALESCE(SUM(st.donations_sol), 0) as donations_24h
      FROM streamers s
      LEFT JOIN streamer_stats st ON s.id = st.streamer_id
        AND st.ts > (strftime('%s', 'now') - 86400)
      WHERE s.is_approved = 1
      GROUP BY s.id
      ORDER BY avg_viewers DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all()

    return c.json({
      streamers: streamers.results,
      pagination: {
        limit,
        offset,
        total: streamers.results?.length || 0
      }
    })
  } catch (error) {
    console.error('Error fetching streamers:', error)
    return c.json({ error: 'Failed to fetch streamers' }, 500)
  }
})

streamersRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')

    const streamer = await c.env.DB.prepare(`
      SELECT
        s.*,
        COALESCE(AVG(st.viewers), 0) as avg_viewers,
        COALESCE(SUM(st.gas_sol), 0) as gas_24h,
        COALESCE(SUM(st.donations_sol), 0) as donations_24h,
        COALESCE(MAX(st.ts), 0) as last_update
      FROM streamers s
      LEFT JOIN streamer_stats st ON s.id = st.streamer_id
        AND st.ts > (strftime('%s', 'now') - 86400)
      WHERE s.id = ? OR s.handle = ?
      GROUP BY s.id
    `).bind(id, id).first()

    if (!streamer) {
      return c.json({ error: 'Streamer not found' }, 404)
    }

    const card = await c.env.DB.prepare(`
      SELECT * FROM cards WHERE streamer_id = ?
    `).bind(streamer.id).first()

    const recentStats = await c.env.DB.prepare(`
      SELECT * FROM streamer_stats
      WHERE streamer_id = ?
      ORDER BY ts DESC
      LIMIT 24
    `).bind(streamer.id).all()

    return c.json({
      streamer,
      card,
      stats: recentStats.results
    })
  } catch (error) {
    console.error('Error fetching streamer:', error)
    return c.json({ error: 'Failed to fetch streamer' }, 500)
  }
})

streamersRoutes.post('/', async (c) => {
  try {
    const { handle, token_ca, avatar_url } = await c.req.json()

    if (!handle) {
      return c.json({ error: 'Handle is required' }, 400)
    }

    const id = crypto.randomUUID()

    await c.env.DB.prepare(`
      INSERT INTO streamers (id, handle, token_ca, avatar_url, is_approved)
      VALUES (?, ?, ?, ?, 0)
    `).bind(id, handle, token_ca, avatar_url).run()

    const streamer = await c.env.DB.prepare(`
      SELECT * FROM streamers WHERE id = ?
    `).bind(id).first()

    return c.json({ streamer }, 201)
  } catch (error) {
    console.error('Error creating streamer:', error)
    return c.json({ error: 'Failed to create streamer' }, 500)
  }
})