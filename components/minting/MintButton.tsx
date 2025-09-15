'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/lib/hooks/useWallet'
import { useMinting } from '@/lib/hooks/useMinting'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Loader2, Zap, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MintButtonProps {
  cardId: string
  streamerId: string
  className?: string
  onMintSuccess?: (mint: any) => void
  onMintError?: (error: string) => void
}

export function MintButton({
  cardId,
  streamerId,
  className,
  onMintSuccess,
  onMintError
}: MintButtonProps) {
  const { connected, balance } = useWallet()
  const { loading, quote, getQuote, mintCard, clearQuote, canMint } = useMinting()
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    if (quote && quote.expires_at) {
      const updateTimer = () => {
        const now = Math.floor(Date.now() / 1000)
        const remaining = Math.max(0, quote.expires_at - now)
        setTimeLeft(remaining)

        if (remaining === 0) {
          clearQuote()
        }
      }

      updateTimer()
      const interval = setInterval(updateTimer, 1000)

      return () => clearInterval(interval)
    }
  }, [quote, clearQuote])

  const handleGetQuote = async () => {
    try {
      await getQuote(cardId)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get quote'
      onMintError?.(message)
    }
  }

  const handleMint = async () => {
    try {
      const result = await mintCard(cardId)

      if (result.success && result.mint) {
        onMintSuccess?.(result.mint)
      } else {
        onMintError?.(result.error || 'Minting failed')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Minting failed'
      onMintError?.(message)
    }
  }

  if (!connected) {
    return (
      <WalletMultiButton className={cn(
        "!bg-pump-green !text-black hover:!bg-pump-green/80 !transition-all !rounded-lg",
        className
      )} />
    )
  }

  if (!canMint) {
    return (
      <button
        disabled
        className={cn(
          "bg-gray-600 text-gray-400 px-6 py-3 rounded-lg font-semibold cursor-not-allowed",
          className
        )}
      >
        Wallet Required
      </button>
    )
  }

  if (loading) {
    return (
      <button
        disabled
        className={cn(
          "bg-pump-green/50 text-black px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 cursor-not-allowed",
          className
        )}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Processing...</span>
      </button>
    )
  }

  if (!quote) {
    return (
      <button
        onClick={handleGetQuote}
        className={cn(
          "bg-pump-green text-black px-6 py-3 rounded-lg font-semibold hover:bg-pump-green/80 transition-all flex items-center space-x-2 glow-button",
          className
        )}
      >
        <Zap className="w-4 h-4" />
        <span>Get Mint Price</span>
      </button>
    )
  }

  const priceSOL = quote.price_lamports / 1e9
  const hasEnoughBalance = balance !== null && balance >= priceSOL

  if (!hasEnoughBalance) {
    return (
      <button
        disabled
        className={cn(
          "bg-red-600/50 text-red-200 px-6 py-3 rounded-lg font-semibold cursor-not-allowed",
          className
        )}
      >
        Insufficient Balance
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>Price: {priceSOL.toFixed(3)} SOL</span>
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      <button
        onClick={handleMint}
        className={cn(
          "w-full bg-pump-green text-black px-6 py-3 rounded-lg font-semibold hover:bg-pump-green/80 transition-all flex items-center justify-center space-x-2 glow-button",
          className
        )}
      >
        <Zap className="w-4 h-4" />
        <span>Mint Card</span>
      </button>
    </div>
  )
}