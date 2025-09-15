'use client'

import { useState, useEffect } from 'react'
import { useWallet } from './useWallet'

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

export function useCollection() {
  const { connected, publicKey } = useWallet()
  const [mints, setMints] = useState<UserMint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (connected && publicKey) {
      fetchUserMints()
    } else {
      setMints([])
    }
  }, [connected, publicKey])

  const fetchUserMints = async () => {
    if (!publicKey) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/users/${publicKey.toBase58()}/mints`)

      if (!response.ok) {
        throw new Error('Failed to fetch user collection')
      }

      const data = await response.json()
      setMints(data.mints || [])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error fetching user mints:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMintsByTier = (tier: string) => {
    return mints.filter(mint => mint.card?.tier === tier)
  }

  const getTotalValue = () => {
    return mints.length
  }

  const getUniqueStreamers = () => {
    const streamers = new Set(mints.map(mint => mint.card?.streamer_handle).filter(Boolean))
    return streamers.size
  }

  const refreshCollection = () => {
    if (connected && publicKey) {
      fetchUserMints()
    }
  }

  return {
    mints,
    loading,
    error,
    getMintsByTier,
    getTotalValue,
    getUniqueStreamers,
    refreshCollection,
    hasCollection: mints.length > 0
  }
}