'use client'

import { useState, useEffect } from 'react'
import { PremiumCard } from '@/components/cards/PremiumCard'
import { Loader2, Sparkles, TrendingUp } from 'lucide-react'

interface Streamer {
  id: string
  handle: string
  token_ca?: string
  avatar_url?: string
  viewers: number
  gas_sol: number
  donations_sol: number
  volume_sol: number
  holders: number
}

export function FeaturedStreamers() {
  const [streamers, setStreamers] = useState<Streamer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStreamers() {
      try {
        const response = await fetch('/api/streamers')
        if (response.ok) {
          const data = await response.json()
          setStreamers(data.streamers?.slice(0, 8) || [])
        } else {
          setStreamers(mockStreamers)
        }
      } catch (error) {
        console.error('Failed to fetch streamers:', error)
        setStreamers(mockStreamers)
      } finally {
        setLoading(false)
      }
    }

    fetchStreamers()
  }, [])

  const mockStreamers: Streamer[] = [
    {
      id: '1',
      handle: 'PumpKing',
      token_ca: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PumpKing',
      viewers: 2500,
      gas_sol: 12.5,
      donations_sol: 1.5,
      volume_sol: 45000,
      holders: 8500
    },
    {
      id: '2',
      handle: 'StreamLord',
      token_ca: 'So11111111111111111111111111111111111111112',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=StreamLord',
      viewers: 1800,
      gas_sol: 8.9,
      donations_sol: 0.8,
      volume_sol: 28000,
      holders: 5200
    },
    {
      id: '3',
      handle: 'CryptoQueen',
      token_ca: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoQueen',
      viewers: 3200,
      gas_sol: 20.0,
      donations_sol: 2.5,
      volume_sol: 67000,
      holders: 12000
    },
    {
      id: '4',
      handle: 'TokenMaster',
      token_ca: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TokenMaster',
      viewers: 950,
      gas_sol: 4.5,
      donations_sol: 0.3,
      volume_sol: 15000,
      holders: 2800
    },
    {
      id: '5',
      handle: 'MythicStreamer',
      token_ca: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MythicStreamer',
      viewers: 5000,
      gas_sol: 35.0,
      donations_sol: 5.0,
      volume_sol: 120000,
      holders: 25000
    }
  ]

  const getTierFromStats = (streamer: Streamer): 'bronze' | 'silver' | 'gold' | 'diamond' | 'mythic' => {
    if (streamer.viewers >= 4000 && streamer.gas_sol >= 30) return 'mythic'
    if (streamer.viewers >= 2500 && streamer.gas_sol >= 15) return 'diamond'
    if (streamer.viewers >= 1500 && streamer.gas_sol >= 8) return 'gold'
    if (streamer.viewers >= 800 && streamer.gas_sol >= 4) return 'silver'
    return 'bronze'
  }

  const getMintPrice = (tier: string): number => {
    switch (tier) {
      case 'mythic': return 2.5
      case 'diamond': return 1.0
      case 'gold': return 0.5
      case 'silver': return 0.2
      case 'bronze': return 0.1
      default: return 0.1
    }
  }

  if (loading) {
    return (
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-pump-green" />
              <p className="text-gray-400">Loading featured streamers...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-6 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pump-green/5 to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 holo-card rounded-full px-6 py-2 mb-6">
            <Sparkles className="w-5 h-5 text-pump-green animate-pulse" />
            <span className="cyber-text text-sm text-pump-green">Featured Collection</span>
          </div>

          <h2 className="cyber-text text-5xl md:text-6xl mb-6">
            <span className="bg-gradient-to-r from-pump-green via-electric-blue to-neon-pink bg-clip-text text-transparent">
              Hottest Cards
            </span>
          </h2>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Top performing streamers with the most valuable cards.
            Mint now before tier upgrades increase the price!
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
          {streamers.map((streamer) => {
            const tier = getTierFromStats(streamer)
            const mintPrice = getMintPrice(tier)

            return (
              <PremiumCard
                key={streamer.id}
                streamer={streamer}
                tier={tier}
                mintPrice={mintPrice}
                onMint={() => console.log(`Minting card for ${streamer.handle}`)}
                className="mx-auto"
              />
            )
          })}
        </div>

        {/* View More Button */}
        <div className="text-center">
          <button className="outline-button inline-flex items-center space-x-2 text-lg px-8 py-4">
            <TrendingUp className="w-5 h-5" />
            <span>View All Streamers</span>
          </button>
        </div>
      </div>
    </section>
  )
}