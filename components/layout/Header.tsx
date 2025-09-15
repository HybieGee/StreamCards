'use client'

import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Zap, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const { connected } = useWallet()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-primary/20 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Zap className="w-8 h-8 text-primary group-hover:text-secondary transition-colors duration-300" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-secondary/20 transition-colors duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="cyber-text text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                PumpCards
              </span>
              <span className="text-xs text-gray-400 -mt-1">Stream the Future</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/market"
              className="relative text-gray-300 hover:text-primary transition-all duration-300 group"
            >
              <span>Market</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link
              href="/my"
              className="relative text-gray-300 hover:text-secondary transition-all duration-300 group"
            >
              <span>My Cards</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300"></div>
            </Link>
            {connected && (
              <Link
                href="/admin"
                className="relative text-gray-300 hover:text-accent transition-all duration-300 group"
              >
                <span>Admin</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"></div>
              </Link>
            )}
          </nav>

          {/* Desktop Wallet Button */}
          <div className="hidden md:block">
            <WalletMultiButton className="neon-button !bg-gradient-to-r !from-purple-600 !to-accent !border-0" />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-primary/20">
            <nav className="flex flex-col space-y-4 mt-4">
              <Link
                href="/market"
                className="text-gray-300 hover:text-primary transition-colors px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Market
              </Link>
              <Link
                href="/my"
                className="text-gray-300 hover:text-secondary transition-colors px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Cards
              </Link>
              {connected && (
                <Link
                  href="/admin"
                  className="text-gray-300 hover:text-accent transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              <div className="pt-2">
                <WalletMultiButton className="neon-button !bg-gradient-to-r !from-purple-600 !to-accent !border-0 !w-full" />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}