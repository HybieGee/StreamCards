'use client'

import { useState } from 'react'
import { useWallet } from './useWallet'
import { useConnection } from '@solana/wallet-adapter-react'
import {
  PublicKey,
  Transaction,
  SystemProgram
} from '@solana/web3.js'

interface CreateOrderParams {
  nftMint: string
  priceLamports: number
}

interface BuyOrderParams {
  orderId: string
  priceLamports: number
}

export function useMarketplace() {
  const { connected, publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  const [loading, setLoading] = useState(false)

  const createOrder = async (params: CreateOrderParams) => {
    if (!connected || !publicKey || !signTransaction) {
      throw new Error('Wallet not connected')
    }

    try {
      setLoading(true)

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nft_mint: params.nftMint,
          seller_pubkey: publicKey.toBase58(),
          price_lamports: params.priceLamports
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create order')
      }

      const data = await response.json()
      return data.order
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const buyOrder = async (params: BuyOrderParams) => {
    if (!connected || !publicKey || !signTransaction) {
      throw new Error('Wallet not connected')
    }

    try {
      setLoading(true)

      const treasuryPubkey = new PublicKey(
        process.env.NEXT_PUBLIC_TREASURY_PUBKEY ||
        'GUFxwDrsLzSQ27xxTVe4y9BARZ6cENWmjzwe8XPy7AKu'
      )

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryPubkey,
          lamports: params.priceLamports,
        })
      )

      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      const signedTransaction = await signTransaction(transaction)
      const txid = await connection.sendRawTransaction(signedTransaction.serialize())

      await connection.confirmTransaction(txid, 'confirmed')

      const response = await fetch(`/api/orders/${params.orderId}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyer_pubkey: publicKey.toBase58(),
          transaction: txid
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to buy order')
      }

      const data = await response.json()
      return data.fill
    } catch (error) {
      console.error('Error buying order:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const cancelOrder = async (orderId: string) => {
    if (!connected || !publicKey) {
      throw new Error('Wallet not connected')
    }

    try {
      setLoading(true)

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seller_pubkey: publicKey.toBase58()
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel order')
      }

      return true
    } catch (error) {
      console.error('Error cancelling order:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async (filters?: {
    status?: string
    limit?: number
    offset?: number
  }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.set('status', filters.status)
      if (filters?.limit) params.set('limit', filters.limit.toString())
      if (filters?.offset) params.set('offset', filters.offset.toString())

      const response = await fetch(`/api/orders?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      return data.orders || []
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  }

  return {
    loading,
    createOrder,
    buyOrder,
    cancelOrder,
    fetchOrders,
    canTrade: connected && !!publicKey
  }
}