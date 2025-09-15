'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Sparkles, TrendingUp, Zap } from 'lucide-react'

export function Hero() {
  const { connected } = useWallet()

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-pump-green/5 via-transparent to-electric-blue/5" />

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center space-x-2 bg-pump-green/10 border border-pump-green/30 rounded-full px-6 py-2 mb-8">
          <Sparkles className="w-4 h-4 text-pump-green" />
          <span className="text-pump-green text-sm font-medium">
            Live Trading Cards for Pump.fun Streamers
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pump-green via-electric-blue to-neon-pink bg-clip-text text-transparent leading-tight">
          Collect the Pump
          <br />
          Stream the Future
        </h1>

        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Dynamic NFT trading cards that evolve with streamer performance.
          Mint cards of your favorite pump.fun streamers and watch their value
          change in real-time based on live metrics.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          {!connected ? (
            <WalletMultiButton className="!bg-pump-green !text-black hover:!bg-pump-green/80 !transition-all !rounded-lg !text-lg !px-8 !py-4" />
          ) : (
            <button className="bg-pump-green text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-pump-green/80 transition-all glow-button">
              Start Collecting
            </button>
          )}

          <button className="border-2 border-pump-green text-pump-green px-8 py-4 rounded-lg font-semibold text-lg hover:bg-pump-green/10 transition-all">
            Explore Market
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-pump-green/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-pump-green" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Dynamic Pricing</h3>
            <p className="text-gray-400">
              Card prices change in real-time based on streamer performance
            </p>
          </div>

          <div className="text-center">
            <div className="bg-electric-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-electric-blue" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Auto Discovery</h3>
            <p className="text-gray-400">
              New streamers automatically discovered and cards generated
            </p>
          </div>

          <div className="text-center">
            <div className="bg-neon-pink/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-neon-pink" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Tier Evolution</h3>
            <p className="text-gray-400">
              Cards upgrade tiers as streamers hit performance milestones
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}