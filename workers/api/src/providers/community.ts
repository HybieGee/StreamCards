import { StreamerProvider, StreamerData } from './base'

export class CommunityProvider extends StreamerProvider {
  name = 'Community'
  enabled = true

  constructor(private communityUrls: string[] = []) {
    super()
    this.enabled = communityUrls.length > 0
  }

  async fetchStreamers(): Promise<StreamerData[]> {
    if (!this.enabled) {
      console.warn('Community provider is disabled (no URLs configured)')
      return []
    }

    try {
      const allStreamers: StreamerData[] = []

      for (const url of this.communityUrls) {
        try {
          const streamers = await this.fetchFromUrl(url)
          allStreamers.push(...streamers)
        } catch (error) {
          console.warn(`Error fetching from community URL ${url}:`, error)
        }
      }

      console.log(`Community provider found ${allStreamers.length} streamers`)
      return this.deduplicateStreamers(allStreamers)
    } catch (error) {
      console.error('Error in community provider:', error)
      return []
    }
  }

  private async fetchFromUrl(url: string): Promise<StreamerData[]> {
    const response = await this.fetchWithRetry(url, {
      headers: {
        'Accept': 'application/json',
      }
    })

    const data = await response.json()

    if (!data.streamers || !Array.isArray(data.streamers)) {
      throw new Error('Invalid response format from community API')
    }

    const streamers: StreamerData[] = []

    for (const item of data.streamers) {
      try {
        const streamerData = this.normalizeStreamerData(item)
        if (this.validateStreamerData(streamerData)) {
          streamers.push(streamerData)
        }
      } catch (error) {
        console.warn('Error normalizing streamer data:', error)
      }
    }

    return streamers
  }

  private normalizeStreamerData(data: any): StreamerData {
    return {
      handle: this.normalizeHandle(data.handle || data.name || data.username),
      token_ca: data.token_ca || data.tokenAddress || data.contract,
      avatar_url: data.avatar_url || data.avatar || data.image ||
                  this.generateAvatarUrl(data.handle || data.name),
      viewers: Number(data.viewers || data.viewerCount || data.live_viewers || 0),
      gas_sol: Number(data.gas_sol || data.gas || data.fees || data.gasUsed || 0),
      donations_sol: Number(data.donations_sol || data.donations || data.tips || 0),
      volume_sol: Number(data.volume_sol || data.volume || data.tradingVolume || 0),
      holders: Number(data.holders || data.holderCount || data.unique_holders || 0),
      last_seen: data.last_seen || data.lastSeen || data.timestamp || Date.now()
    }
  }

  private normalizeHandle(handle: string): string {
    if (!handle || typeof handle !== 'string') {
      return `User${Math.random().toString(36).substring(2, 8)}`
    }

    return handle
      .replace(/^@/, '')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .substring(0, 20) || `User${Math.random().toString(36).substring(2, 8)}`
  }

  private deduplicateStreamers(streamers: StreamerData[]): StreamerData[] {
    const seen = new Set<string>()
    const deduplicated: StreamerData[] = []

    for (const streamer of streamers) {
      const key = streamer.handle.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        deduplicated.push(streamer)
      }
    }

    return deduplicated
  }
}