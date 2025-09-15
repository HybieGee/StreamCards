import { StreamerProvider, StreamerData } from './base'
import { HeliusProvider } from './helius'
import { CommunityProvider } from './community'
import { PumpFunProvider } from './PumpFunProvider'
import { DemoProvider } from './demo'
import type { Env } from '../index'

export class ProviderManager {
  private providers: StreamerProvider[] = []

  constructor(env: Env) {
    this.initializeProviders(env)
  }

  private initializeProviders(env: Env): void {
    // Primary provider: pump.fun live data
    const pumpFunProvider = new PumpFunProvider()
    this.providers.push(pumpFunProvider)

    // Secondary provider: Helius (if API key available)
    const heliusProvider = new HeliusProvider(env.HELIUS_API_KEY || '')
    this.providers.push(heliusProvider)

    // Community providers (if URLs configured)
    const communityUrls = this.parseCommunityUrls(env)
    const communityProvider = new CommunityProvider(communityUrls)
    this.providers.push(communityProvider)

    // Fallback: Demo data (only if no other providers work)
    const demoProvider = new DemoProvider()
    this.providers.push(demoProvider)

    console.log(`Initialized ${this.providers.length} streamer providers (pump.fun, helius, community, demo)`)
  }

  private parseCommunityUrls(env: Env): string[] {
    const urlsEnv = (env as any).COMMUNITY_STREAMS_URLS || ''
    if (!urlsEnv) return []

    try {
      return urlsEnv.split(',')
        .map((url: string) => url.trim())
        .filter((url: string) => url.length > 0)
    } catch {
      return []
    }
  }

  async discoverStreamers(): Promise<StreamerData[]> {
    console.log('Starting streamer discovery across all providers...')

    const allStreamers: StreamerData[] = []
    const providerResults = await Promise.allSettled(
      this.providers.map(async (provider) => {
        if (!provider.enabled) {
          console.log(`Skipping disabled provider: ${provider.name}`)
          return []
        }

        try {
          console.log(`Fetching from provider: ${provider.name}`)
          const startTime = Date.now()
          const streamers = await provider.fetchStreamers()
          const duration = Date.now() - startTime

          console.log(`Provider ${provider.name} returned ${streamers.length} streamers in ${duration}ms`)
          return streamers
        } catch (error) {
          console.error(`Error in provider ${provider.name}:`, error)
          return []
        }
      })
    )

    for (const result of providerResults) {
      if (result.status === 'fulfilled') {
        allStreamers.push(...result.value)
      }
    }

    const deduplicated = this.deduplicateStreamers(allStreamers)
    const filtered = this.filterStreamers(deduplicated)

    console.log(`Discovery complete: ${allStreamers.length} total, ${deduplicated.length} deduplicated, ${filtered.length} filtered`)

    return filtered
  }

  private deduplicateStreamers(streamers: StreamerData[]): StreamerData[] {
    const uniqueStreamers = new Map<string, StreamerData>()

    for (const streamer of streamers) {
      const key = this.generateStreamerKey(streamer)

      if (!uniqueStreamers.has(key)) {
        uniqueStreamers.set(key, streamer)
      } else {
        const existing = uniqueStreamers.get(key)!
        const merged = this.mergeStreamerData(existing, streamer)
        uniqueStreamers.set(key, merged)
      }
    }

    return Array.from(uniqueStreamers.values())
  }

  private generateStreamerKey(streamer: StreamerData): string {
    if (streamer.token_ca) {
      return `token:${streamer.token_ca}`
    }
    return `handle:${streamer.handle.toLowerCase()}`
  }

  private mergeStreamerData(existing: StreamerData, incoming: StreamerData): StreamerData {
    return {
      handle: existing.handle,
      token_ca: existing.token_ca || incoming.token_ca,
      avatar_url: existing.avatar_url || incoming.avatar_url,
      viewers: Math.max(existing.viewers, incoming.viewers),
      gas_sol: existing.gas_sol + incoming.gas_sol,
      donations_sol: existing.donations_sol + incoming.donations_sol,
      volume_sol: Math.max(existing.volume_sol, incoming.volume_sol),
      holders: Math.max(existing.holders, incoming.holders),
      last_seen: Math.max(existing.last_seen, incoming.last_seen)
    }
  }

  private filterStreamers(streamers: StreamerData[]): StreamerData[] {
    return streamers.filter(streamer => {
      if (streamer.handle.length < 2) {
        return false
      }

      if (streamer.viewers < 0 || streamer.gas_sol < 0 || streamer.donations_sol < 0) {
        return false
      }

      if (streamer.handle.includes('test') || streamer.handle.includes('demo')) {
        return false
      }

      return true
    })
  }

  getProviderStatus(): Array<{ name: string; enabled: boolean }> {
    return this.providers.map(provider => ({
      name: provider.name,
      enabled: provider.enabled
    }))
  }
}