'use client'

import { useState } from 'react'
import { X, DollarSign, Loader2 } from 'lucide-react'
import { useMarketplace } from '@/lib/hooks/useMarketplace'

interface ListingModalProps {
  isOpen: boolean
  onClose: () => void
  nft: {
    id: string
    nft_mint: string
    card: {
      tier: string
      streamer_handle: string
      streamer_avatar: string
    }
  }
  onSuccess?: () => void
}

export function ListingModal({ isOpen, onClose, nft, onSuccess }: ListingModalProps) {
  const [price, setPrice] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { loading, createOrder } = useMarketplace()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const priceNumber = parseFloat(price)
    if (isNaN(priceNumber) || priceNumber <= 0) {
      setError('Please enter a valid price')
      return
    }

    if (priceNumber < 0.001) {
      setError('Minimum price is 0.001 SOL')
      return
    }

    try {
      await createOrder({
        nftMint: nft.nft_mint,
        priceLamports: Math.floor(priceNumber * 1e9)
      })

      onSuccess?.()
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create listing')
    }
  }

  const handleClose = () => {
    setPrice('')
    setError(null)
    onClose()
  }

  const suggestedPrices = {
    bronze: 0.015,
    silver: 0.03,
    gold: 0.08,
    diamond: 0.2,
    mythic: 0.5
  }

  const suggestedPrice = suggestedPrices[nft.card.tier as keyof typeof suggestedPrices] || 0.01

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-deep-black border border-pump-green/30 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-pump-green">
            List for Sale
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-lg">🎯</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">
                @{nft.card.streamer_handle}
              </h3>
              <div className="text-sm text-gray-400 capitalize">
                {nft.card.tier} Tier
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Sale Price (SOL)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                step="0.001"
                min="0.001"
                placeholder="0.000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-pump-green"
                required
              />
            </div>
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setPrice(suggestedPrice.toString())}
                className="text-sm text-pump-green hover:text-pump-green/80 transition-colors"
              >
                Suggested: {suggestedPrice} SOL
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-gray-900/50 rounded-lg p-4 text-sm text-gray-300">
            <h4 className="font-semibold text-white mb-2">Listing Details:</h4>
            <ul className="space-y-1">
              <li>• Marketplace fee: 2.5%</li>
              <li>• You'll receive: {price ? (parseFloat(price) * 0.975).toFixed(3) : '0.000'} SOL</li>
              <li>• Listing can be cancelled anytime</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !price}
              className="flex-1 bg-pump-green text-black py-3 px-4 rounded-lg font-semibold hover:bg-pump-green/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Listing...</span>
                </>
              ) : (
                <span>Create Listing</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}