'use client'

import { useState, useEffect } from 'react'
import { StreamerCard } from '@/components/cards/StreamerCard'
import { Loader2 } from 'lucide-react'

interface Streamer {
  id: string
  handle: string
  avatar_url: string
  viewers: number
  gas24h: number
  donations24h: number
  tier: string
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
          setStreamers(data.streamers || [])
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
      avatar_url: '/avatars/pumpking.jpg',
      viewers: 2500,
      gas24h: 125,
      donations24h: 15,
      tier: 'gold'
    },
    {
      id: '2',
      handle: 'StreamLord',
      avatar_url: '/avatars/streamlord.jpg',
      viewers: 1800,
      gas24h: 89,
      donations24h: 8,
      tier: 'silver'
    },
    {
      id: '3',
      handle: 'CryptoQueen',
      avatar_url: '/avatars/cryptoqueen.jpg',
      viewers: 3200,
      gas24h: 200,
      donations24h: 25,
      tier: 'diamond'
    },
    {
      id: '4',
      handle: 'TokenMaster',
      avatar_url: '/avatars/tokenmaster.jpg',
      viewers: 950,
      gas24h: 45,
      donations24h: 3,
      tier: 'bronze'
    }
  ]

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-pump-green" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pump-green to-electric-blue bg-clip-text text-transparent">
            Featured Streamers
          </h2>
          <p className="text-gray-400 text-lg">
            Top performing streamers with the hottest cards right now
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {streamers.map((streamer) => (
            <StreamerCard key={streamer.id} streamer={streamer} />
          ))}
        </div>
      </div>
    </section>
  )
}