'use client'

import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Zap } from 'lucide-react'

export function Header() {
  const { connected } = useWallet()

  return (
    <header className="sticky top-0 z-50 bg-deep-black/80 backdrop-blur-md border-b border-pump-green/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-pump-green" />
            <span className="text-2xl font-bold text-glow text-pump-green">
              PumpCards
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/market"
              className="text-gray-300 hover:text-pump-green transition-colors"
            >
              Market
            </Link>
            <Link
              href="/my"
              className="text-gray-300 hover:text-pump-green transition-colors"
            >
              My Cards
            </Link>
            {connected && (
              <Link
                href="/admin"
                className="text-gray-300 hover:text-pump-green transition-colors"
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <WalletMultiButton className="!bg-pump-green !text-black hover:!bg-pump-green/80 !transition-all !rounded-lg" />
          </div>
        </div>
      </div>
    </header>
  )
}