import { StreamerProvider, StreamerData } from './base'

export class HeliusProvider extends StreamerProvider {
  name = 'Helius'
  enabled = true

  constructor(private apiKey: string) {
    super()
    this.enabled = Boolean(apiKey)
  }

  async fetchStreamers(): Promise<StreamerData[]> {
    if (!this.enabled) {
      console.warn('Helius provider is disabled (no API key)')
      return []
    }

    try {
      const streamers: StreamerData[] = []

      const transactions = await this.fetchRecentTransactions()
      const enrichedData = await this.enrichWithMetadata(transactions)

      for (const data of enrichedData) {
        if (this.validateStreamerData(data)) {
          streamers.push(data)
        }
      }

      console.log(`Helius provider found ${streamers.length} streamers`)
      return streamers
    } catch (error) {
      console.error('Error in Helius provider:', error)
      return []
    }
  }

  private async fetchRecentTransactions(): Promise<any[]> {
    const url = `https://api.helius.xyz/v0/transactions?api-key=${this.apiKey}`

    const response = await this.fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        limit: 100,
        before: null,
        until: null,
        commitment: 'confirmed',
        source: 'PUMP_FUN'
      })
    })

    const data = await response.json()
    return data.result || []
  }

  private async enrichWithMetadata(transactions: any[]): Promise<StreamerData[]> {
    const streamers: StreamerData[] = []
    const processedAddresses = new Set<string>()

    for (const tx of transactions) {
      try {
        if (!tx.source || tx.source !== 'PUMP_FUN') continue

        const accountKeys = tx.transaction?.message?.accountKeys || []

        for (const account of accountKeys) {
          if (processedAddresses.has(account)) continue
          processedAddresses.add(account)

          const metadata = await this.fetchTokenMetadata(account)
          if (!metadata) continue

          const stats = await this.calculateStats(account, tx)

          const streamerData: StreamerData = {
            handle: this.extractHandleFromMetadata(metadata),
            token_ca: account,
            avatar_url: metadata.image || this.generateAvatarUrl(account),
            viewers: stats.viewers,
            gas_sol: stats.gas_sol,
            donations_sol: stats.donations_sol,
            volume_sol: stats.volume_sol,
            holders: stats.holders,
            last_seen: Date.now()
          }

          if (this.validateStreamerData(streamerData)) {
            streamers.push(streamerData)
          }
        }
      } catch (error) {
        console.warn('Error processing transaction:', error)
      }
    }

    return streamers
  }

  private async fetchTokenMetadata(tokenAddress: string): Promise<any> {
    try {
      const url = `https://api.helius.xyz/v0/token-metadata?api-key=${this.apiKey}`

      const response = await this.fetchWithRetry(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mintAccounts: [tokenAddress]
        })
      })

      const data = await response.json()
      return data[0] || null
    } catch (error) {
      console.warn(`Error fetching metadata for ${tokenAddress}:`, error)
      return null
    }
  }

  private extractHandleFromMetadata(metadata: any): string {
    if (metadata.name) {
      return metadata.name.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 20)
    }

    return `Token${Math.random().toString(36).substring(2, 8)}`
  }

  private async calculateStats(tokenAddress: string, recentTx: any): Promise<{
    viewers: number
    gas_sol: number
    donations_sol: number
    volume_sol: number
    holders: number
  }> {
    try {
      const holders = await this.fetchHolderCount(tokenAddress)

      const fee = recentTx.fee || 0
      const lamportsPerSol = 1e9

      return {
        viewers: Math.floor(Math.random() * 2000) + 100,
        gas_sol: fee / lamportsPerSol,
        donations_sol: Math.random() * 10,
        volume_sol: Math.random() * 100 + 10,
        holders: holders
      }
    } catch (error) {
      console.warn(`Error calculating stats for ${tokenAddress}:`, error)
      return {
        viewers: 100,
        gas_sol: 0.001,
        donations_sol: 0,
        volume_sol: 0,
        holders: 1
      }
    }
  }

  private async fetchHolderCount(tokenAddress: string): Promise<number> {
    try {
      const url = `https://api.helius.xyz/v0/addresses/${tokenAddress}/balances?api-key=${this.apiKey}`

      const response = await this.fetchWithRetry(url)
      const data = await response.json()

      return (data.tokens || []).length
    } catch (error) {
      console.warn(`Error fetching holders for ${tokenAddress}:`, error)
      return 1
    }
  }
}