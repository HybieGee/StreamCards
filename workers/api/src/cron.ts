import type { Env } from './index'
import { ProviderManager } from './providers/manager'
import { updateSurgeMetrics } from './utils/surge'
import { processStreamerUpgrades } from './utils/tiers'

export async function cronHandler(
  event: ScheduledEvent,
  env: Env,
  ctx: ExecutionContext
): Promise<void> {
  const cron = event.cron

  switch (cron) {
    case '*/2 * * * *':
      await handleStreamerDiscovery(env)
      break
    case '*/10 * * * *':
      await handleTierUpgrades(env)
      break
    case '*/1 * * * *':
      await handlePriceRefresh(env)
      break
    default:
      console.log('Unknown cron schedule:', cron)
  }
}

async function handleStreamerDiscovery(env: Env): Promise<void> {
  try {
    console.log('Running streamer discovery...')

    const providerManager = new ProviderManager(env)
    const discoveredStreamers = await providerManager.discoverStreamers()

    let processed = 0
    let created = 0
    let updated = 0

    for (const streamerData of discoveredStreamers) {
      try {
        let streamer = await env.DB.prepare(`
          SELECT * FROM streamers WHERE handle = ? OR token_ca = ?
        `).bind(streamerData.handle, streamerData.token_ca || '').first()

        if (!streamer) {
          const id = crypto.randomUUID()
          await env.DB.prepare(`
            INSERT INTO streamers (id, handle, token_ca, avatar_url, is_approved)
            VALUES (?, ?, ?, ?, 1)
          `).bind(id, streamerData.handle, streamerData.token_ca, streamerData.avatar_url).run()

          await env.DB.prepare(`
            INSERT INTO cards (id, streamer_id, tier, mint_price_lamports)
            VALUES (?, ?, 'bronze', 10000000)
          `).bind(crypto.randomUUID(), id).run()

          created++
          streamer = { id }
        } else {
          if (streamerData.avatar_url && !streamer.avatar_url) {
            await env.DB.prepare(`
              UPDATE streamers SET avatar_url = ? WHERE id = ?
            `).bind(streamerData.avatar_url, streamer.id).run()
          }
          updated++
        }

        await env.DB.prepare(`
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

    console.log(`Streamer discovery completed: ${processed} processed, ${created} created, ${updated} updated`)
  } catch (error) {
    console.error('Error in streamer discovery:', error)
  }
}


async function handleTierUpgrades(env: Env): Promise<void> {
  try {
    console.log('Running tier upgrades...')

    const results = await processStreamerUpgrades(env)

    console.log(`Tier upgrades completed: ${results.processed} processed, ${results.upgraded} upgraded, ${results.errors} errors`)
  } catch (error) {
    console.error('Error in tier upgrades:', error)
  }
}


async function handlePriceRefresh(env: Env): Promise<void> {
  try {
    console.log('Running price refresh...')

    await env.DB.prepare(`
      DELETE FROM price_quotes WHERE expires_at < strftime('%s', 'now')
    `).run()

    const oldActivity = Math.floor(Date.now() / 1000) - (24 * 60 * 60)
    await env.DB.prepare(`
      DELETE FROM mint_activity WHERE minted_at < ?
    `).bind(oldActivity).run()

    await updateSurgeMetrics(env)

    console.log('Price refresh completed')
  } catch (error) {
    console.error('Error in price refresh:', error)
  }
}