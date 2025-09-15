'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Eye, DollarSign, TrendingUp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreamerCardProps {
  streamer: {
    id: string
    handle: string
    avatar_url: string
    viewers: number
    gas24h: number
    donations24h: number
    tier: string
  }
}

export function StreamerCard({ streamer }: StreamerCardProps) {
  const getTierStyles = (tier: string) => {
    switch (tier.toLowerCase()) {
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

  return (
    <Link href={`/streamer/${streamer.handle}`}>
      <div className={cn(
        'relative rounded-lg p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10',
        getTierStyles(streamer.tier)
      )}>
        <div className="absolute top-4 right-4">
          <span className={cn(
            'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide',
            streamer.tier === 'mythic' && 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
            streamer.tier === 'diamond' && 'bg-electric-blue text-black',
            streamer.tier === 'gold' && 'bg-yellow-400 text-black',
            streamer.tier === 'silver' && 'bg-gray-300 text-black',
            streamer.tier === 'bronze' && 'bg-gray-600 text-white'
          )}>
            {streamer.tier}
          </span>
        </div>

        <div className="flex flex-col items-center mb-4">
          <div className="relative w-16 h-16 mb-3">
            <Image
              src={streamer.avatar_url}
              alt={streamer.handle}
              fill
              className="rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${streamer.handle}`
              }}
            />
          </div>
          <h3 className="text-lg font-bold text-center text-white">
            @{streamer.handle}
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>Viewers</span>
            </div>
            <span className="font-semibold">{formatNumber(streamer.viewers)}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>Gas 24h</span>
            </div>
            <span className="font-semibold">{streamer.gas24h} SOL</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4" />
              <span>Donations</span>
            </div>
            <span className="font-semibold">{streamer.donations24h} SOL</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/20">
          <button className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium">
            View Card
          </button>
        </div>
      </div>
    </Link>
  )
}