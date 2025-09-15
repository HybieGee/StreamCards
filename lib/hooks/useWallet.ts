'use client'

import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useState, useEffect } from 'react'

export function useWallet() {
  const { connected, publicKey, signTransaction, signMessage } = useSolanaWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance()
    } else {
      setBalance(null)
    }
  }, [connected, publicKey])

  const fetchBalance = async () => {
    if (!publicKey || !connection) return

    try {
      setLoading(true)
      const balance = await connection.getBalance(publicKey)
      setBalance(balance / LAMPORTS_PER_SOL)
    } catch (error) {
      console.error('Error fetching balance:', error)
      setBalance(null)
    } finally {
      setLoading(false)
    }
  }

  const signMessageWithWallet = async (message: string): Promise<Uint8Array | null> => {
    if (!signMessage) {
      throw new Error('Wallet does not support message signing')
    }

    try {
      const encodedMessage = new TextEncoder().encode(message)
      const signature = await signMessage(encodedMessage)
      return signature
    } catch (error) {
      console.error('Error signing message:', error)
      return null
    }
  }

  return {
    connected,
    publicKey,
    balance,
    loading,
    signTransaction,
    signMessage: signMessageWithWallet,
    refreshBalance: fetchBalance,
    address: publicKey?.toBase58() || null
  }
}