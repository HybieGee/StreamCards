import { StreamerProvider, StreamerData } from './base'

export class DemoProvider extends StreamerProvider {
  name = 'Demo'
  enabled = true

  private readonly demoStreamers = [
    {
      handle: 'PumpKing',
      token_ca: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      base_viewers: 2500,
      base_gas: 125,
      base_donations: 15
    },
    {
      handle: 'StreamLord',
      token_ca: 'So11111111111111111111111111111111111111112',
      base_viewers: 1800,
      base_gas: 89,
      base_donations: 8
    },
    {
      handle: 'CryptoQueen',
      token_ca: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      base_viewers: 3200,
      base_gas: 200,
      base_donations: 25
    },
    {
      handle: 'TokenMaster',
      token_ca: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      base_viewers: 950,
      base_gas: 45,
      base_donations: 3
    },
    {
      handle: 'SolanaStreamer',
      token_ca: 'SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y',
      base_viewers: 1200,
      base_gas: 67,
      base_donations: 12
    },
    {
      handle: 'DeFiDegen',
      token_ca: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
      base_viewers: 890,
      base_gas: 34,
      base_donations: 6
    },
    {
      handle: 'NFTCollector',
      token_ca: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
      base_viewers: 2100,
      base_gas: 98,
      base_donations: 18
    },
    {
      handle: 'MemeTokenKing',
      token_ca: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
      base_viewers: 1650,
      base_gas: 78,
      base_donations: 9
    }
  ]

  async fetchStreamers(): Promise<StreamerData[]> {
    console.log('Demo provider generating synthetic data...')

    try {
      const streamers: StreamerData[] = []
      const now = Date.now()

      for (const demo of this.demoStreamers) {
        const variance = 0.2
        const timeVariance = Math.sin((now / 60000) % (2 * Math.PI)) * 0.1

        const streamerData: StreamerData = {
          handle: demo.handle,
          token_ca: demo.token_ca,
          avatar_url: this.generateAvatarUrl(demo.handle),
          viewers: Math.floor(
            demo.base_viewers * (1 + (Math.random() - 0.5) * variance + timeVariance)
          ),
          gas_sol: Math.max(0,
            demo.base_gas * (1 + (Math.random() - 0.5) * variance)
          ),
          donations_sol: Math.max(0,
            demo.base_donations * (1 + (Math.random() - 0.5) * variance)
          ),
          volume_sol: Math.random() * 500 + 100,
          holders: Math.floor(Math.random() * 1000) + 50,
          last_seen: now
        }

        if (this.validateStreamerData(streamerData)) {
          streamers.push(streamerData)
        }
      }

      if (Math.random() < 0.1) {
        streamers.push(this.generateRandomStreamer())
      }

      console.log(`Demo provider generated ${streamers.length} streamers`)
      return streamers
    } catch (error) {
      console.error('Error in demo provider:', error)
      return []
    }
  }

  private generateRandomStreamer(): StreamerData {
    const handles = [
      'NewStreamer', 'FreshFace', 'CryptoNewbie', 'PumpFresh',
      'TokenStartup', 'SolanaNoob', 'DeFiLearner', 'BlockchainBeginner'
    ]

    const randomHandle = handles[Math.floor(Math.random() * handles.length)] +
                        Math.random().toString(36).substring(2, 5)

    return {
      handle: randomHandle,
      token_ca: this.generateRandomTokenAddress(),
      avatar_url: this.generateAvatarUrl(randomHandle),
      viewers: Math.floor(Math.random() * 500) + 50,
      gas_sol: Math.random() * 20 + 1,
      donations_sol: Math.random() * 5,
      volume_sol: Math.random() * 100 + 10,
      holders: Math.floor(Math.random() * 100) + 10,
      last_seen: Date.now()
    }
  }

  private generateRandomTokenAddress(): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    let result = ''
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}