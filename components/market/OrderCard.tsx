'use client'

import Image from 'next/image'
import { Clock, User } from 'lucide-react'
import { useWallet } from '@/lib/hooks/useWallet'
import { cn } from '@/lib/utils'

interface OrderCardProps {
  order: {
    id: string
    nft_mint: string
    seller_pubkey: string
    price_lamports: number
    status: string
    created_at: number
    card_tier: string
    streamer_handle: string
    streamer_avatar: string
  }
  viewMode: 'grid' | 'list'
  onPurchase: () => void
}

export function OrderCard({ order, viewMode, onPurchase }: OrderCardProps) {
  const { connected, address } = useWallet()

  const getTierStyles = (tier: string) => {
    switch (tier.toLowerCase()) {
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

  const formatPrice = (lamports: number) => {
    return (lamports / 1e9).toFixed(3)
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays}d ago`
    } else if (diffHours > 0) {
      return `${diffHours}h ago`
    } else {
      return 'Recently'
    }
  }

  const isOwnOrder = address === order.seller_pubkey

  if (viewMode === 'list') {
    return (
      <div className="bg-deep-black/80 border border-pump-green/20 rounded-lg p-4 hover:border-pump-green/40 transition-colors">
        <div className="flex items-center space-x-4">
          <div className={cn(
            'w-16 h-16 rounded-lg bg-gradient-to-br border-2 flex items-center justify-center flex-shrink-0',
            getTierStyles(order.card_tier)
          )}>
            <Image
              src={order.streamer_avatar}
              alt={order.streamer_handle}
              width={40}
              height={40}
              className="rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.streamer_handle}`
              }}
            />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-white">
              @{order.streamer_handle}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span className="capitalize">{order.card_tier}</span>
              <span>•</span>
              <span>{formatTime(order.created_at)}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold text-pump-green">
              {formatPrice(order.price_lamports)} SOL
            </div>
            <div className="text-xs text-gray-400">
              {order.nft_mint.slice(0, 8)}...
            </div>
          </div>

          <button
            onClick={onPurchase}
            disabled={!connected || isOwnOrder}
            className={cn(
              'px-4 py-2 rounded-lg font-semibold transition-colors',
              connected && !isOwnOrder
                ? 'bg-pump-green text-black hover:bg-pump-green/80'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            )}
          >
            {isOwnOrder ? 'Your Order' : connected ? 'Buy' : 'Connect Wallet'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-deep-black/80 border border-pump-green/20 rounded-lg overflow-hidden hover:border-pump-green/40 transition-colors">
      <div className={cn(
        'h-48 bg-gradient-to-br border-b-2 flex items-center justify-center relative',
        getTierStyles(order.card_tier)
      )}>
        <Image
          src={order.streamer_avatar}
          alt={order.streamer_handle}
          width={80}
          height={80}
          className="rounded-full"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.streamer_handle}`
          }}
        />

        <div className="absolute top-3 right-3">
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide',
            order.card_tier === 'mythic' && 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
            order.card_tier === 'diamond' && 'bg-electric-blue text-black',
            order.card_tier === 'gold' && 'bg-yellow-400 text-black',
            order.card_tier === 'silver' && 'bg-gray-300 text-black',
            order.card_tier === 'bronze' && 'bg-gray-600 text-white'
          )}>
            {order.card_tier}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white mb-2">
          @{order.streamer_handle}
        </h3>

        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{formatTime(order.created_at)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <User className="w-3 h-3" />
            <span>{order.seller_pubkey.slice(0, 4)}...</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-bold text-pump-green">
            {formatPrice(order.price_lamports)} SOL
          </div>
          <div className="text-xs text-gray-400">
            {order.nft_mint.slice(0, 8)}...
          </div>
        </div>

        <button
          onClick={onPurchase}
          disabled={!connected || isOwnOrder}
          className={cn(
            'w-full py-2 rounded-lg font-semibold transition-colors',
            connected && !isOwnOrder
              ? 'bg-pump-green text-black hover:bg-pump-green/80'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          )}
        >
          {isOwnOrder ? 'Your Order' : connected ? 'Buy Now' : 'Connect Wallet'}
        </button>
      </div>
    </div>
  )
}