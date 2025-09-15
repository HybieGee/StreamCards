'use client'

import { useState, useEffect } from 'react'
import { Zap, Edit2, Save, X } from 'lucide-react'

interface TierThreshold {
  id: number
  tier: string
  min_viewers: number
  min_gas_24h: number
  min_donations_24h: number
  created_at: number
  updated_at: number
}

export function TierManagement() {
  const [thresholds, setThresholds] = useState<TierThreshold[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [tempValues, setTempValues] = useState<Partial<TierThreshold>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchThresholds()
  }, [])

  const fetchThresholds = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/thresholds')

      if (response.ok) {
        const data = await response.json()
        setThresholds(data.thresholds || [])
      }
    } catch (error) {
      console.error('Error fetching thresholds:', error)
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (threshold: TierThreshold) => {
    setEditing(threshold.tier)
    setTempValues({
      min_viewers: threshold.min_viewers,
      min_gas_24h: threshold.min_gas_24h,
      min_donations_24h: threshold.min_donations_24h
    })
  }

  const cancelEditing = () => {
    setEditing(null)
    setTempValues({})
  }

  const saveThreshold = async (tier: string) => {
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/thresholds/${tier}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tempValues)
      })

      if (response.ok) {
        setThresholds(prev => prev.map(t =>
          t.tier === tier
            ? { ...t, ...tempValues } as TierThreshold
            : t
        ))
        setEditing(null)
        setTempValues({})
      }
    } catch (error) {
      console.error('Error saving threshold:', error)
    } finally {
      setSaving(false)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return 'text-gray-400'
      case 'silver': return 'text-gray-300'
      case 'gold': return 'text-yellow-400'
      case 'diamond': return 'text-electric-blue'
      case 'mythic': return 'text-neon-pink'
      default: return 'text-white'
    }
  }

  const getTierIcon = (tier: string) => {
    const icons = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      diamond: '💎',
      mythic: '⭐'
    }
    return icons[tier.toLowerCase() as keyof typeof icons] || '📊'
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
      <div className="flex items-center space-x-3">
        <Zap className="w-5 h-5 text-pump-green" />
        <h2 className="text-xl font-bold text-white">Tier Thresholds</h2>
      </div>

      <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="text-left p-4 text-gray-300 font-medium">Tier</th>
                <th className="text-left p-4 text-gray-300 font-medium">Min Viewers</th>
                <th className="text-left p-4 text-gray-300 font-medium">Min Gas 24h (SOL)</th>
                <th className="text-left p-4 text-gray-300 font-medium">Min Donations 24h (SOL)</th>
                <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {thresholds.map(threshold => (
                <tr key={threshold.tier} className="border-t border-gray-700">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getTierIcon(threshold.tier)}</span>
                      <span className={`font-semibold capitalize ${getTierColor(threshold.tier)}`}>
                        {threshold.tier}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    {editing === threshold.tier ? (
                      <input
                        type="number"
                        min="0"
                        value={tempValues.min_viewers || 0}
                        onChange={(e) => setTempValues({
                          ...tempValues,
                          min_viewers: parseInt(e.target.value) || 0
                        })}
                        className="w-24 bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white focus:outline-none focus:border-pump-green"
                      />
                    ) : (
                      <span className="text-white">{threshold.min_viewers.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editing === threshold.tier ? (
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={tempValues.min_gas_24h || 0}
                        onChange={(e) => setTempValues({
                          ...tempValues,
                          min_gas_24h: parseFloat(e.target.value) || 0
                        })}
                        className="w-24 bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white focus:outline-none focus:border-pump-green"
                      />
                    ) : (
                      <span className="text-white">{threshold.min_gas_24h}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editing === threshold.tier ? (
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={tempValues.min_donations_24h || 0}
                        onChange={(e) => setTempValues({
                          ...tempValues,
                          min_donations_24h: parseFloat(e.target.value) || 0
                        })}
                        className="w-24 bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white focus:outline-none focus:border-pump-green"
                      />
                    ) : (
                      <span className="text-white">{threshold.min_donations_24h}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editing === threshold.tier ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveThreshold(threshold.tier)}
                          disabled={saving}
                          className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(threshold)}
                        className="p-2 bg-pump-green text-black rounded hover:bg-pump-green/80 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
        <h3 className="font-semibold text-white mb-3">Tier Progression</h3>
        <p className="text-gray-400 text-sm mb-3">
          Streamers automatically upgrade when they meet ALL threshold requirements for a tier.
          Upgrades happen every 10 minutes via cron job.
        </p>
        <div className="flex flex-wrap gap-2">
          {thresholds.map((threshold, index) => (
            <div key={threshold.tier} className="flex items-center">
              <span className={`text-sm font-medium ${getTierColor(threshold.tier)}`}>
                {threshold.tier.toUpperCase()}
              </span>
              {index < thresholds.length - 1 && (
                <span className="mx-2 text-gray-500">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}