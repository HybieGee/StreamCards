'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MoreVertical, DollarSign, ExternalLink, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserMint {
  id: string
  card_id: string
  nft_mint: string
  owner_pubkey: string
  edition?: number
  created_at: number
  card?: {
    id: string
    tier: string
    streamer_handle: string
    streamer_avatar: string
  }
}

interface CollectionGridProps {
  mints: UserMint[]
}

export function CollectionGrid({ mints }: CollectionGridProps) {
  const [filter, setFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'tier'>('date')

  const getTierOrder = (tier: string) => {
    const order = { bronze: 1, silver: 2, gold: 3, diamond: 4, mythic: 5 }
    return order[tier as keyof typeof order] || 0
  }

  const filteredMints = mints.filter(mint => {
    if (filter === 'all') return true
    return mint.card?.tier === filter
  })

  const sortedMints = [...filteredMints].sort((a, b) => {
    if (sortBy === 'tier') {
      return getTierOrder(b.card?.tier || '') - getTierOrder(a.card?.tier || '')
    }
    return b.created_at - a.created_at
  })

  const getTierStyles = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'bronze':
        return 'from-gray-800 to-gray-900 border-pump-green/30'
      case 'silver':
        return 'from-gray-600 to-gray-700 border-pump-green/50'
      case 'gold':
        return 'from-yellow-600 to-yellow-700 border-pump-green'
      case 'diamond':
        return 'from-cyan-400 to-blue-500 border-electric-blue'
      case 'mythic':
        return 'from-purple-600 via-pink-500 to-electric-blue border-neon-pink'
      default:
        return 'from-gray-800 to-gray-900 border-pump-green/30'
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const tiers = ['all', 'mythic', 'diamond', 'gold', 'silver', 'bronze']

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {tiers.map(tier => (
            <button
              key={tier}
              onClick={() => setFilter(tier)}
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize',
                filter === tier
                  ? 'bg-pump-green text-black'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              )}
            >
              {tier}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'tier')}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-pump-green"
        >
          <option value="date">Sort by Date</option>
          <option value="tier">Sort by Tier</option>
        </select>
      </div>

      {sortedMints.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No cards found with the current filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMints.map(mint => (
            <CollectionCard key={mint.id} mint={mint} />
          ))}
        </div>
      )}
    </div>
  )
}

function CollectionCard({ mint }: { mint: UserMint }) {
  const [showMenu, setShowMenu] = useState(false)

  const getTierStyles = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'bronze':
        return 'from-gray-800 to-gray-900 border-pump-green/30'
      case 'silver':
        return 'from-gray-600 to-gray-700 border-pump-green/50'
      case 'gold':
        return 'from-yellow-600 to-yellow-700 border-pump-green'
      case 'diamond':
        return 'from-cyan-400 to-blue-500 border-electric-blue'
      case 'mythic':
        return 'from-purple-600 via-pink-500 to-electric-blue border-neon-pink'
      default:
        return 'from-gray-800 to-gray-900 border-pump-green/30'
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  return (
    <div className="bg-deep-black/80 border border-pump-green/20 rounded-lg overflow-hidden hover:border-pump-green/40 transition-colors relative">
      <div className={cn(
        'h-48 bg-gradient-to-br border-b-2 flex items-center justify-center relative',
        getTierStyles(mint.card?.tier || '')
      )}>
        <Image
          src={mint.card?.streamer_avatar || ''}
          alt={mint.card?.streamer_handle || ''}
          width={80}
          height={80}
          className="rounded-full"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${mint.card?.streamer_handle}`
          }}
        />

        <div className="absolute top-3 left-3">
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide',
            mint.card?.tier === 'mythic' && 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
            mint.card?.tier === 'diamond' && 'bg-electric-blue text-black',
            mint.card?.tier === 'gold' && 'bg-yellow-400 text-black',
            mint.card?.tier === 'silver' && 'bg-gray-300 text-black',
            mint.card?.tier === 'bronze' && 'bg-gray-600 text-white'
          )}>
            {mint.card?.tier}
          </span>
        </div>

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="absolute top-3 right-3 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-white" />
        </button>

        {showMenu && (
          <div className="absolute top-10 right-3 bg-deep-black border border-pump-green/30 rounded-lg py-2 z-10 min-w-[120px]">
            <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-white hover:bg-pump-green/10 transition-colors">
              <Tag className="w-3 h-3" />
              <span>List for Sale</span>
            </button>
            <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-white hover:bg-pump-green/10 transition-colors">
              <ExternalLink className="w-3 h-3" />
              <span>View NFT</span>
            </button>
          </div>
        )}

        {mint.edition && (
          <div className="absolute bottom-3 right-3 bg-black/50 px-2 py-1 rounded text-xs text-white">
            #{mint.edition}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white mb-2">
          @{mint.card?.streamer_handle}
        </h3>

        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
          <span>Minted {formatDate(mint.created_at)}</span>
          <span>{mint.nft_mint.slice(0, 8)}...</span>
        </div>

        <div className="flex space-x-2">
          <button className="flex-1 bg-pump-green text-black py-2 px-3 rounded-lg font-semibold hover:bg-pump-green/80 transition-colors text-sm">
            List for Sale
          </button>
          <button className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}