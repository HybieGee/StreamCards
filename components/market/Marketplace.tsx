'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Grid, List } from 'lucide-react'
import { OrderCard } from './OrderCard'

interface MarketOrder {
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

export function Marketplace() {
  const [orders, setOrders] = useState<MarketOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTier, setSelectedTier] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'price' | 'date'>('date')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders')

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        setOrders(mockOrders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders(mockOrders)
    } finally {
      setLoading(false)
    }
  }

  const mockOrders: MarketOrder[] = [
    {
      id: '1',
      nft_mint: 'ABC123...',
      seller_pubkey: 'DEF456...',
      price_lamports: 25000000,
      status: 'active',
      created_at: Date.now() / 1000,
      card_tier: 'gold',
      streamer_handle: 'PumpKing',
      streamer_avatar: '/avatars/pumpking.jpg'
    },
    {
      id: '2',
      nft_mint: 'GHI789...',
      seller_pubkey: 'JKL012...',
      price_lamports: 15000000,
      status: 'active',
      created_at: Date.now() / 1000 - 3600,
      card_tier: 'silver',
      streamer_handle: 'StreamLord',
      streamer_avatar: '/avatars/streamlord.jpg'
    },
    {
      id: '3',
      nft_mint: 'MNO345...',
      seller_pubkey: 'PQR678...',
      price_lamports: 75000000,
      status: 'active',
      created_at: Date.now() / 1000 - 7200,
      card_tier: 'diamond',
      streamer_handle: 'CryptoQueen',
      streamer_avatar: '/avatars/cryptoqueen.jpg'
    }
  ]

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.streamer_handle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTier = !selectedTier || order.card_tier === selectedTier
    return matchesSearch && matchesTier
  })

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'price') {
      return b.price_lamports - a.price_lamports
    }
    return b.created_at - a.created_at
  })

  const tiers = ['bronze', 'silver', 'gold', 'diamond', 'mythic']

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pump-green to-electric-blue bg-clip-text text-transparent">
          Marketplace
        </h1>
        <p className="text-gray-400 text-lg">
          Trade PumpCards with other collectors
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <div className="bg-deep-black/80 border border-pump-green/20 rounded-lg p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search streamers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-pump-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Tier
              </label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pump-green"
              >
                <option value="">All Tiers</option>
                {tiers.map(tier => (
                  <option key={tier} value={tier}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price' | 'date')}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pump-green"
              >
                <option value="date">Latest Listed</option>
                <option value="price">Highest Price</option>
              </select>
            </div>
          </div>
        </div>

        <div className="lg:w-3/4">
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-400">
              {sortedOrders.length} items found
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-pump-green text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-pump-green text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-pump-green border-t-transparent rounded-full" />
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No items found</p>
              <p className="text-gray-500 text-sm mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {sortedOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  viewMode={viewMode}
                  onPurchase={() => {
                    console.log('Purchase order:', order.id)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}