import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { streamersRoutes } from './routes/streamers'
import { cardsRoutes } from './routes/cards'
import { ordersRoutes } from './routes/orders'
import { ingestRoutes } from './routes/ingest'
import { adminRoutes } from './routes/admin'
import { usersRoutes } from './routes/users'
import { cronHandler } from './cron'

export interface Env {
  DB: D1Database
  CACHE: KVNamespace
  INGEST_QUEUE: Queue
  SOLANA_RPC_URL: string
  HELIUS_API_KEY: string
  HELIUS_WEBHOOK_SECRET: string
  PRICE_QUOTE_SIGNING_SECRET: string
  PROJECT_TREASURY_PUBKEY: string
  MINT_COLLECTION_ADDRESS: string
  ENVIRONMENT: string
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors({
  origin: ['http://localhost:3000', 'https://pumpcards.io'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.get('/', (c) => {
  return c.json({
    message: 'PumpCards API',
    version: '1.0.0',
    status: 'healthy',
    environment: c.env.ENVIRONMENT || 'development'
  })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() })
})

app.route('/api/streamers', streamersRoutes)
app.route('/api/cards', cardsRoutes)
app.route('/api/orders', ordersRoutes)
app.route('/api/ingest', ingestRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api/users', usersRoutes)

export default {
  fetch: app.fetch,
  scheduled: cronHandler,
  queue: async (batch: MessageBatch<any>, env: Env, ctx: ExecutionContext) => {
    for (const message of batch.messages) {
      try {
        const { type, data } = message.body

        switch (type) {
          case 'STREAMER_DISCOVERY':
            // Handle streamer discovery
            console.log('Processing streamer discovery:', data)
            break
          case 'TIER_UPGRADE':
            // Handle tier upgrade
            console.log('Processing tier upgrade:', data)
            break
          case 'PRICE_UPDATE':
            // Handle price update
            console.log('Processing price update:', data)
            break
          default:
            console.warn('Unknown message type:', type)
        }

        message.ack()
      } catch (error) {
        console.error('Error processing queue message:', error)
        message.retry()
      }
    }
  }
}