'use client'

import { useState } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { useWallet } from './useWallet'
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js'

interface MintQuote {
  quote_id: string
  card_id: string
  price_lamports: number
  signature: string
  expires_at: number
  valid_for_seconds: number
}

interface MintResult {
  success: boolean
  mint?: {
    id: string
    nft_mint: string
    card_id: string
    owner_pubkey: string
    transaction: string
  }
  error?: string
}

export function useMinting() {
  const { connected, publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  const [loading, setLoading] = useState(false)
  const [quote, setQuote] = useState<MintQuote | null>(null)

  const getQuote = async (cardId: string): Promise<MintQuote | null> => {
    if (!connected || !publicKey) {
      throw new Error('Wallet not connected')
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/cards/${cardId}/quote`)

      if (!response.ok) {
        throw new Error('Failed to get price quote')
      }

      const quoteData = await response.json()
      setQuote(quoteData)
      return quoteData
    } catch (error) {
      console.error('Error getting quote:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const mintCard = async (cardId: string): Promise<MintResult> => {
    if (!connected || !publicKey || !signTransaction) {
      throw new Error('Wallet not connected')
    }

    try {
      setLoading(true)

      let currentQuote = quote
      if (!currentQuote || currentQuote.card_id !== cardId) {
        currentQuote = await getQuote(cardId)
      }

      if (!currentQuote) {
        throw new Error('Failed to get price quote')
      }

      if (Date.now() / 1000 > currentQuote.expires_at) {
        throw new Error('Quote has expired')
      }

      const treasuryPubkey = new PublicKey(
        process.env.NEXT_PUBLIC_TREASURY_PUBKEY ||
        'GUFxwDrsLzSQ27xxTVe4y9BARZ6cENWmjzwe8XPy7AKu'
      )

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryPubkey,
          lamports: currentQuote.price_lamports,
        })
      )

      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      const signedTransaction = await signTransaction(transaction)
      const txid = await connection.sendRawTransaction(signedTransaction.serialize())

      await connection.confirmTransaction(txid, 'confirmed')

      const response = await fetch(`/api/cards/${cardId}/mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quote_id: currentQuote.quote_id,
          wallet_pubkey: publicKey.toBase58(),
          transaction: txid
        })
      })

      if (!response.ok) {
        throw new Error('Failed to mint NFT')
      }

      const result = await response.json()
      setQuote(null)

      return {
        success: true,
        mint: result.mint
      }
    } catch (error) {
      console.error('Error minting card:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    } finally {
      setLoading(false)
    }
  }

  const clearQuote = () => {
    setQuote(null)
  }

  return {
    loading,
    quote,
    getQuote,
    mintCard,
    clearQuote,
    canMint: connected && !!publicKey
  }
}