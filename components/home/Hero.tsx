'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Sparkles, TrendingUp, Zap, Search, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  const { connected } = useWallet()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 holo-card rounded-full px-8 py-3 mb-8 group hover:scale-105 transition-transform duration-300">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <span className="cyber-text text-sm bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Live Trading Cards for Pump.fun Streamers
          </span>
          <Sparkles className="w-5 h-5 text-secondary animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Main Headline */}
        <h1 className="cyber-text text-6xl md:text-8xl lg:text-9xl mb-8 leading-none">
          <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent cyber-glow">
            Collect the Pump
          </span>
          <span className="block bg-gradient-to-r from-accent via-secondary to-primary bg-clip-text text-transparent cyber-glow mt-4">
            Stream the Future
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
          Dynamic NFT trading cards that evolve with streamer performance.
          <br className="hidden md:block" />
          Mint cards of your favorite <span className="text-primary font-semibold">pump.fun</span> streamers and watch their value change in real-time.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
          {!connected ? (
            <WalletMultiButton className="neon-button !text-lg !px-12 !py-4 !text-white" />
          ) : (
            <Link href="/market" className="neon-button inline-flex items-center space-x-2 text-lg px-12 py-4 text-white no-underline">
              <Sparkles className="w-5 h-5" />
              <span>Start Collecting</span>
            </Link>
          )}

          <Link href="/market" className="outline-button inline-flex items-center space-x-2 text-lg px-10 py-4 no-underline">
            <Search className="w-5 h-5" />
            <span>Explore Market</span>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Dynamic Pricing */}
          <div className="holo-card p-8 rounded-2xl group hover:scale-105 transition-all duration-300">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                <TrendingUp className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h3 className="cyber-text text-xl mb-4 text-primary">⚡ Dynamic Pricing</h3>
            <p className="text-gray-400 leading-relaxed">
              Card prices update in real-time based on streamer performance, gas generation, and viewer metrics
            </p>
          </div>

          {/* Auto Discovery */}
          <div className="holo-card p-8 rounded-2xl group hover:scale-105 transition-all duration-300">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-2xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-secondary/20 transition-all duration-300">
                <Zap className="w-10 h-10 text-secondary" />
              </div>
              <div className="absolute inset-0 bg-secondary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h3 className="cyber-text text-xl mb-4 text-secondary">🔍 Auto Discovery</h3>
            <p className="text-gray-400 leading-relaxed">
              New streamers automatically discovered from pump.fun and cards generated instantly
            </p>
          </div>

          {/* Tier Evolution */}
          <div className="holo-card p-8 rounded-2xl group hover:scale-105 transition-all duration-300">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-accent/20 transition-all duration-300">
                <BarChart3 className="w-10 h-10 text-accent" />
              </div>
              <div className="absolute inset-0 bg-accent/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h3 className="cyber-text text-xl mb-4 text-accent">🚀 Tier Evolution</h3>
            <p className="text-gray-400 leading-relaxed">
              Cards upgrade from Bronze → Silver → Gold → Diamond → Mythic as streamers hit milestones
            </p>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-3 h-3 bg-primary rounded-full animate-ping opacity-75" />
      <div className="absolute top-40 right-20 w-2 h-2 bg-secondary rounded-full animate-ping opacity-50" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 left-1/4 w-4 h-4 bg-accent rounded-full animate-ping opacity-60" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-20 right-10 w-2 h-2 bg-primary rounded-full animate-ping opacity-75" style={{ animationDelay: '3s' }} />
    </section>
  )
}