'use client'

import { Trophy, Users, Coins, TrendingUp } from 'lucide-react'

interface CollectionStatsProps {
  totalCards: number
  uniqueStreamers: number
  mintsByTier: {
    bronze: number
    silver: number
    gold: number
    diamond: number
    mythic: number
  }
}

export function CollectionStats({ totalCards, uniqueStreamers, mintsByTier }: CollectionStatsProps) {
  const totalValue = Object.entries(mintsByTier).reduce((sum, [tier, count]) => {
    const tierValues = {
      bronze: 0.01,
      silver: 0.025,
      gold: 0.06,
      diamond: 0.15,
      mythic: 0.40
    }
    return sum + (count * (tierValues[tier as keyof typeof tierValues] || 0))
  }, 0)

  return (
    <div className="space-y-6">
      <div className="bg-deep-black/80 border border-pump-green/20 rounded-lg p-6">
        <h2 className="text-lg font-bold text-white mb-4">Collection Overview</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="w-4 h-4 text-pump-green" />
              <span className="text-gray-400">Total Cards</span>
            </div>
            <span className="text-white font-semibold">{totalCards}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-electric-blue" />
              <span className="text-gray-400">Streamers</span>
            </div>
            <span className="text-white font-semibold">{uniqueStreamers}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-neon-pink" />
              <span className="text-gray-400">Est. Value</span>
            </div>
            <span className="text-white font-semibold">{totalValue.toFixed(3)} SOL</span>
          </div>
        </div>
      </div>

      <div className="bg-deep-black/80 border border-pump-green/20 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Tier Breakdown</h3>

        <div className="space-y-3">
          {Object.entries(mintsByTier).map(([tier, count]) => {
            const percentage = totalCards > 0 ? (count / totalCards * 100) : 0

            const tierColors = {
              bronze: 'bg-gray-600',
              silver: 'bg-gray-400',
              gold: 'bg-yellow-400',
              diamond: 'bg-electric-blue',
              mythic: 'bg-gradient-to-r from-purple-500 to-pink-500'
            }

            return (
              <div key={tier}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white capitalize">
                    {tier}
                  </span>
                  <span className="text-sm text-gray-400">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${tierColors[tier as keyof typeof tierColors]}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {mintsByTier.mythic > 0 && (
        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-neon-pink/30 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Trophy className="w-5 h-5 text-neon-pink" />
            <h3 className="text-lg font-bold text-white">Rare Collection!</h3>
          </div>
          <p className="text-sm text-gray-300">
            You own {mintsByTier.mythic} Mythic tier card{mintsByTier.mythic !== 1 ? 's' : ''}!
            These are ultra-rare and highly valuable.
          </p>
        </div>
      )}
    </div>
  )
}