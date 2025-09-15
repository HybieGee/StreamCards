'use client'

import { useState, useEffect } from 'react'
import { Activity, Zap, TrendingUp, Server, Database, Clock } from 'lucide-react'

interface SystemStats {
  providers: Array<{
    name: string
    enabled: boolean
  }>
  surges: Array<{
    card_id: string
    recent_mints: number
    surge_multiplier: number
    cooldown_until: number
  }>
  upgrades: Array<{
    streamer_id: string
    handle: string
    from: string
    to: string
    timestamp: number
  }>
}

export function SystemStatus() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSystemStats()
  }, [])

  const fetchSystemStats = async () => {
    try {
      setLoading(true)

      const [providersRes, surgesRes, upgradesRes] = await Promise.all([
        fetch('/api/admin/providers'),
        fetch('/api/admin/surge'),
        fetch('/api/admin/upgrades?limit=5')
      ])

      const [providers, surges, upgrades] = await Promise.all([
        providersRes.json(),
        surgesRes.json(),
        upgradesRes.json()
      ])

      setStats({
        providers: providers.providers || [],
        surges: surges.surges || [],
        upgrades: upgrades.upgrades || []
      })
    } catch (error) {
      console.error('Error fetching system stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-pump-green border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Server className="w-5 h-5 text-pump-green" />
            <h3 className="font-semibold text-white">Provider Status</h3>
          </div>

          <div className="space-y-3">
            {stats?.providers.map(provider => (
              <div key={provider.name} className="flex items-center justify-between">
                <span className="text-gray-300">{provider.name}</span>
                <div className={`w-3 h-3 rounded-full ${
                  provider.enabled ? 'bg-green-400' : 'bg-red-400'
                }`} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="w-5 h-5 text-electric-blue" />
            <h3 className="font-semibold text-white">Active Surges</h3>
          </div>

          {stats?.surges.length === 0 ? (
            <p className="text-gray-400 text-sm">No active surge pricing</p>
          ) : (
            <div className="space-y-2">
              {stats?.surges.slice(0, 3).map(surge => (
                <div key={surge.card_id} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">
                      Card {surge.card_id.slice(0, 8)}...
                    </span>
                    <span className="text-electric-blue font-semibold">
                      {surge.surge_multiplier.toFixed(2)}x
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {surge.recent_mints} recent mints
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="w-5 h-5 text-neon-pink" />
            <h3 className="font-semibold text-white">System Health</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">API Status</span>
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Database</span>
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Cron Jobs</span>
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-5 h-5 text-pump-green" />
          <h3 className="font-semibold text-white">Recent Tier Upgrades</h3>
        </div>

        {stats?.upgrades.length === 0 ? (
          <p className="text-gray-400">No recent tier upgrades</p>
        ) : (
          <div className="space-y-3">
            {stats?.upgrades.map((upgrade, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <span className="text-white font-medium">@{upgrade.handle}</span>
                  <div className="text-sm text-gray-400">
                    {upgrade.from} → {upgrade.to}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-300">
                    {formatTimeAgo(upgrade.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={fetchSystemStats}
          className="bg-pump-green text-black px-4 py-2 rounded-lg font-semibold hover:bg-pump-green/80 transition-colors"
        >
          Refresh Status
        </button>

        <button
          onClick={() => {
            fetch('/api/admin/upgrades/trigger', { method: 'POST' })
              .then(() => fetchSystemStats())
          }}
          className="bg-electric-blue text-black px-4 py-2 rounded-lg font-semibold hover:bg-electric-blue/80 transition-colors"
        >
          Trigger Upgrades
        </button>
      </div>
    </div>
  )
}