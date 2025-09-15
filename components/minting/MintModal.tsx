'use client'

import { useState } from 'react'
import { X, ExternalLink, Copy, Check } from 'lucide-react'
import { MintButton } from './MintButton'

interface MintModalProps {
  isOpen: boolean
  onClose: () => void
  card: {
    id: string
    streamer_id: string
    tier: string
    streamer_handle?: string
    streamer_avatar?: string
  }
}

export function MintModal({ isOpen, onClose, card }: MintModalProps) {
  const [mintResult, setMintResult] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleMintSuccess = (mint: any) => {
    setMintResult(mint)
  }

  const handleMintError = (error: string) => {
    console.error('Mint error:', error)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setMintResult(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-deep-black border border-pump-green/30 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-pump-green">
            {mintResult ? 'Mint Successful!' : 'Mint PumpCard'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!mintResult ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-pump-green/30 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                @{card.streamer_handle}
              </h3>
              <div className="inline-block px-3 py-1 bg-pump-green/20 text-pump-green text-sm rounded-full">
                {card.tier.toUpperCase()}
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 text-sm text-gray-300">
              <h4 className="font-semibold text-white mb-2">What you're minting:</h4>
              <ul className="space-y-1">
                <li>• Unique NFT trading card</li>
                <li>• Dynamic metadata that evolves</li>
                <li>• Tradeable on the marketplace</li>
                <li>• Tier upgrades automatically</li>
              </ul>
            </div>

            <MintButton
              cardId={card.id}
              streamerId={card.streamer_id}
              onMintSuccess={handleMintSuccess}
              onMintError={handleMintError}
              className="w-full"
            />
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-pump-green/20 to-electric-blue/20 border-2 border-pump-green rounded-lg mx-auto flex items-center justify-center">
              <Check className="w-8 h-8 text-pump-green" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-pump-green mb-2">
                PumpCard Minted!
              </h3>
              <p className="text-gray-400 text-sm">
                Your NFT has been successfully minted and transferred to your wallet.
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">NFT Mint:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm font-mono">
                    {mintResult.nft_mint.slice(0, 8)}...
                  </span>
                  <button
                    onClick={() => copyToClipboard(mintResult.nft_mint)}
                    className="text-gray-400 hover:text-pump-green transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mintResult.transaction && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Transaction:</span>
                  <a
                    href={`https://explorer.solana.com/tx/${mintResult.transaction}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-pump-green hover:text-pump-green/80 transition-colors"
                  >
                    <span className="text-sm">View</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-pump-green text-black px-6 py-3 rounded-lg font-semibold hover:bg-pump-green/80 transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}