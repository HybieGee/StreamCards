export interface StreamerData {
  handle: string
  token_ca?: string
  avatar_url?: string
  viewers: number
  gas_sol: number
  donations_sol: number
  volume_sol: number
  holders: number
  last_seen: number
}

export abstract class StreamerProvider {
  abstract name: string
  abstract enabled: boolean

  abstract fetchStreamers(): Promise<StreamerData[]>

  protected async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    maxRetries: number = 3
  ): Promise<Response> {
    let lastError: Error

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'User-Agent': 'PumpCards/1.0',
            ...options.headers,
          },
        })

        if (response.ok) {
          return response
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      } catch (error) {
        lastError = error as Error
        console.warn(`Attempt ${i + 1} failed for ${url}:`, error)

        if (i < maxRetries - 1) {
          await this.delay(Math.pow(2, i) * 1000)
        }
      }
    }

    throw lastError!
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  protected generateAvatarUrl(handle: string): string {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(handle)}`
  }

  protected validateStreamerData(data: any): data is StreamerData {
    return (
      typeof data.handle === 'string' &&
      data.handle.length > 0 &&
      typeof data.viewers === 'number' &&
      data.viewers >= 0 &&
      typeof data.gas_sol === 'number' &&
      data.gas_sol >= 0 &&
      typeof data.donations_sol === 'number' &&
      data.donations_sol >= 0
    )
  }
}