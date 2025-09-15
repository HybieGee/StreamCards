'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Eye, TrendingUp, DollarSign, Users, Calendar, ExternalLink } from 'lucide-react'
import { MintButton } from '@/components/minting/MintButton'
import { MintModal } from '@/components/minting/MintModal'
import { StatsChart } from './StatsChart'
import { cn } from '@/lib/utils'

interface StreamerProfileProps {
  handle: string
}

interface StreamerData {
  streamer: {
    id: string
    handle: string
    token_ca?: string
    avatar_url?: string
    created_at: number
    avg_viewers: number
    gas_24h: number
    donations_24h: number
    last_update: number
  }
  card?: {
    id: string
    tier: string
    mint_price_lamports: number
    supply: number
    current_price_lamports?: number
  }
  stats: Array<{
    ts: number
    viewers: number
    gas_sol: number
    donations_sol: number
    volume_sol: number
  }>
}

export function StreamerProfile({ handle }: StreamerProfileProps) {
  const [data, setData] = useState<StreamerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMintModal, setShowMintModal] = useState(false)

  useEffect(() => {
    fetchStreamerData()
  }, [handle])

  const fetchStreamerData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/streamers/${handle}`)
      if (!response.ok) {
        throw new Error('Streamer not found')
      }

      const data = await response.json()
      setData(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load streamer')
    } finally {
      setLoading(false)
    }
  }

  const getTierStyles = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'bronze':
        return 'card-bronze'
      case 'silver':
        return 'card-silver'
      case 'gold':
        return 'card-gold'
      case 'diamond':
        return 'card-diamond'
      case 'mythic':
        return 'card-mythic'
      default:
        return 'card-bronze'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-pump-green border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Streamer Not Found</h2>
          <p className="text-gray-400">The streamer @{handle} could not be found.</p>
        </div>
      </div>
    )
  }

  const { streamer, card, stats } = data
  const currentPrice = card?.current_price_lamports || card?.mint_price_lamports || 0

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-deep-black/80 border border-pump-green/20 rounded-lg p-6">
              <div className="flex items-start space-x-6">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={streamer.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${streamer.handle}`}
                    alt={streamer.handle}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    @{streamer.handle}
                  </h1>

                  {card && (
                    <div className="flex items-center space-x-3 mb-4">
                      <span className={cn(
                        'px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide',
                        card.tier === 'mythic' && 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
                        card.tier === 'diamond' && 'bg-electric-blue text-black',
                        card.tier === 'gold' && 'bg-yellow-400 text-black',
                        card.tier === 'silver' && 'bg-gray-300 text-black',
                        card.tier === 'bronze' && 'bg-gray-600 text-white'
                      )}>
                        {card.tier}
                      </span>
                      <span className="text-sm text-gray-400">
                        {card.supply} minted
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-1 text-gray-400 mb-1">
                        <Eye className="w-4 h-4" />
                        <span>Viewers</span>
                      </div>
                      <div className="text-white font-semibold">
                        {formatNumber(streamer.avg_viewers)}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-1 text-gray-400 mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>Gas 24h</span>
                      </div>
                      <div className="text-white font-semibold">
                        {streamer.gas_24h.toFixed(2)} SOL
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-1 text-gray-400 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span>Donations</span>
                      </div>
                      <div className="text-white font-semibold">
                        {streamer.donations_24h.toFixed(2)} SOL
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-1 text-gray-400 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>Joined</span>
                      </div>
                      <div className="text-white font-semibold">
                        {formatDate(streamer.created_at)}
                      </div>
                    </div>
                  </div>

                  {streamer.token_ca && (
                    <div className="mt-4">
                      <a
                        href={`https://explorer.solana.com/address/${streamer.token_ca}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-pump-green hover:text-pump-green/80 transition-colors text-sm"
                      >
                        <span>View Token</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {stats && stats.length > 0 && (
              <div className="bg-deep-black/80 border border-pump-green/20 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Performance Metrics</h2>
                <StatsChart data={stats} />
              </div>
            )}
          </div>

          <div className="space-y-6">
            {card && (
              <div className={cn(
                'rounded-lg p-6 relative overflow-hidden',
                getTierStyles(card.tier)
              )}>
                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      PumpCard
                    </h3>
                    <p className="text-sm text-white/80">
                      Dynamic NFT Trading Card
                    </p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">Current Price:</span>
                      <span className="text-white font-semibold">
                        {(currentPrice / 1e9).toFixed(3)} SOL
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">Supply:</span>
                      <span className="text-white font-semibold">
                        {card.supply}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">Tier:</span>
                      <span className="text-white font-semibold uppercase">
                        {card.tier}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowMintModal(true)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
                  >
                    Mint Card
                  </button>
                </div>
              </div>
            )}

            <div className="bg-deep-black/80 border border-pump-green/20 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">About PumpCards</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>
                  PumpCards are dynamic NFT trading cards that evolve with streamer performance.
                </p>
                <ul className="space-y-1">
                  <li>• Real-time price updates</li>
                  <li>• Automatic tier upgrades</li>
                  <li>• Tradeable on marketplace</li>
                  <li>• Unique collectible metadata</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {card && (
        <MintModal
          isOpen={showMintModal}
          onClose={() => setShowMintModal(false)}
          card={{
            id: card.id,
            streamer_id: streamer.id,
            tier: card.tier,
            streamer_handle: streamer.handle,
            streamer_avatar: streamer.avatar_url
          }}
        />
      )}
    </>
  )
}