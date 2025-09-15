'use client'

import { useCollection } from '@/lib/hooks/useCollection'
import { useWallet } from '@/lib/hooks/useWallet'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { CollectionGrid } from './CollectionGrid'
import { CollectionStats } from './CollectionStats'
import { Loader2, Wallet } from 'lucide-react'

export function MyCollection() {
  const { connected } = useWallet()
  const { mints, loading, error, getMintsByTier, getTotalValue, getUniqueStreamers, hasCollection } = useCollection()

  if (!connected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Connect your Solana wallet to view your PumpCard collection and manage your NFTs.
          </p>
          <WalletMultiButton className="!bg-pump-green !text-black hover:!bg-pump-green/80 !transition-all !rounded-lg !text-lg !px-8 !py-4" />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-pump-green" />
          <span className="ml-3 text-gray-400">Loading your collection...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400 mb-4">
            Error Loading Collection
          </h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!hasCollection) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            No PumpCards Found
          </h1>
          <p className="text-gray-400 mb-8">
            You don't have any PumpCards yet. Start collecting by minting cards of your favorite streamers!
          </p>
          <a
            href="/"
            className="inline-block bg-pump-green text-black px-8 py-4 rounded-lg font-semibold hover:bg-pump-green/80 transition-all"
          >
            Explore Streamers
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pump-green to-electric-blue bg-clip-text text-transparent">
          My Collection
        </h1>
        <p className="text-gray-400 text-lg">
          Manage your PumpCard NFTs and list them for sale
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <CollectionStats
            totalCards={getTotalValue()}
            uniqueStreamers={getUniqueStreamers()}
            mintsByTier={{
              bronze: getMintsByTier('bronze').length,
              silver: getMintsByTier('silver').length,
              gold: getMintsByTier('gold').length,
              diamond: getMintsByTier('diamond').length,
              mythic: getMintsByTier('mythic').length
            }}
          />
        </div>

        <div className="lg:col-span-3">
          <CollectionGrid mints={mints} />
        </div>
      </div>
    </div>
  )
}