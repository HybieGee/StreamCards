'use client'

import Image from 'next/image'
import { Star, TrendingUp, Users, Zap, Eye } from 'lucide-react'
import { useState } from 'react'

interface PremiumCardProps {
  streamer: {
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
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'mythic'
  mintPrice?: number
  supply?: number
  onMint?: () => void
  onBuy?: () => void
  isOwned?: boolean
  className?: string
}

export function PremiumCard({
  streamer,
  tier,
  mintPrice,
  supply = 0,
  onMint,
  onBuy,
  isOwned = false,
  className = ''
}: PremiumCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getTierIcon = () => {
    switch (tier) {
      case 'bronze': return '🥉'
      case 'silver': return '🥈'
      case 'gold': return '🥇'
      case 'diamond': return '💎'
      case 'mythic': return '⭐'
      default: return '🥉'
    }
  }

  const getTierBadgeColor = () => {
    switch (tier) {
      case 'bronze': return 'from-gray-600 to-gray-700 border-gray-500'
      case 'silver': return 'from-gray-400 to-gray-500 border-gray-300'
      case 'gold': return 'from-yellow-500 to-yellow-600 border-yellow-400'
      case 'diamond': return 'from-cyan-400 to-blue-500 border-cyan-300'
      case 'mythic': return 'from-purple-500 via-pink-500 to-cyan-400 border-purple-400'
      default: return 'from-gray-600 to-gray-700 border-gray-500'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatSol = (sol: number) => {
    return `${sol.toFixed(3)} SOL`
  }

  return (
    <div
      className={`card-${tier} w-full max-w-sm h-[600px] group cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Frame */}
      <div className="relative w-full h-full p-4 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getTierBadgeColor()} border`}>
            <span className="text-xs font-bold text-white flex items-center space-x-1">
              <span>{getTierIcon()}</span>
              <span className="uppercase">{tier}</span>
            </span>
          </div>

          {isOwned && (
            <div className="bg-pump-green/20 border border-pump-green/40 rounded-full px-2 py-1">
              <span className="text-xs text-pump-green font-semibold">OWNED</span>
            </div>
          )}
        </div>

        {/* Avatar Section */}
        <div className="relative mb-4 flex-shrink-0">
          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
            {streamer.avatar_url ? (
              <Image
                src={streamer.avatar_url}
                alt={streamer.handle}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                🎭
              </div>
            )}

            {/* Holographic Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
              tier === 'mythic' ? 'from-purple-500 via-pink-500 to-cyan-400' :
              tier === 'diamond' ? 'from-cyan-400 to-blue-500' :
              tier === 'gold' ? 'from-yellow-500 to-yellow-600' :
              tier === 'silver' ? 'from-gray-400 to-gray-500' :
              'from-gray-600 to-gray-700'
            }`} />
          </div>

          {/* Live Indicator */}
          {streamer.viewers > 0 && (
            <div className="absolute top-3 right-3 bg-red-500 rounded-full px-2 py-1 flex items-center space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-xs font-bold text-white">LIVE</span>
            </div>
          )}
        </div>

        {/* Streamer Info */}
        <div className="mb-4 text-center">
          <h3 className="cyber-text text-xl mb-1 text-white truncate">
            @{streamer.handle}
          </h3>
          {streamer.token_ca && (
            <p className="text-xs text-gray-400 font-mono truncate">
              {streamer.token_ca.slice(0, 8)}...{streamer.token_ca.slice(-8)}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
          <div className="bg-black/30 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-1">
              <Eye className="w-4 h-4 text-electric-blue" />
              <span className="text-xs text-gray-400">Viewers</span>
            </div>
            <p className="text-lg font-bold text-white">{formatNumber(streamer.viewers)}</p>
          </div>

          <div className="bg-black/30 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-1">
              <Zap className="w-4 h-4 text-pump-green" />
              <span className="text-xs text-gray-400">Gas 24h</span>
            </div>
            <p className="text-lg font-bold text-white">{formatSol(streamer.gas_sol)}</p>
          </div>

          <div className="bg-black/30 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="w-4 h-4 text-neon-pink" />
              <span className="text-xs text-gray-400">Volume</span>
            </div>
            <p className="text-lg font-bold text-white">{formatSol(streamer.volume_sol)}</p>
          </div>

          <div className="bg-black/30 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="w-4 h-4 text-electric-blue" />
              <span className="text-xs text-gray-400">Holders</span>
            </div>
            <p className="text-lg font-bold text-white">{formatNumber(streamer.holders)}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-600/40 pt-4">
          {mintPrice && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Mint Price</span>
              <span className="cyber-text text-lg text-pump-green">
                {formatSol(mintPrice)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Supply</span>
            <span className="text-sm text-white font-semibold">
              {supply === 0 ? 'Unlimited' : formatNumber(supply)}
            </span>
          </div>

          {/* Action Button */}
          {isOwned ? (
            <button className="w-full neon-button !py-3 !bg-gradient-to-r !from-pump-green !to-electric-blue">
              <Star className="w-4 h-4 mr-2" />
              View Details
            </button>
          ) : onMint ? (
            <button
              onClick={onMint}
              className="w-full neon-button !py-3"
            >
              <Zap className="w-4 h-4 mr-2" />
              Mint Card
            </button>
          ) : onBuy ? (
            <button
              onClick={onBuy}
              className="w-full outline-button !py-3"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Buy Now
            </button>
          ) : (
            <button className="w-full bg-gray-600 text-gray-400 py-3 rounded-xl cursor-not-allowed">
              Coming Soon
            </button>
          )}
        </div>
      </div>

      {/* Mythic Special Effect */}
      {tier === 'mythic' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-cyan-400/10 rounded-2xl animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-4 left-4 w-2 h-2 bg-purple-400 rounded-full animate-ping" />
            <div className="absolute top-8 right-6 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-12 left-8 w-3 h-3 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-6 right-4 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>
      )}
    </div>
  )
}