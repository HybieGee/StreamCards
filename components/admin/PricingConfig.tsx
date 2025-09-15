'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Settings, Save } from 'lucide-react'

interface PricingSettings {
  basePricesSOL: Record<string, number>
  capsSOL: { min: number; max: number }
  weights: {
    viewers: number
    gas24h: number
    donations24h: number
    demand: number
  }
  normalizers: {
    viewers: { p50: number; p90: number }
    gas24h: { p50: number; p90: number }
    donations24h: { p50: number; p90: number }
  }
  surge: {
    windowMin: number
    thresholdMints: number
    maxMultiplier: number
    cooldownMin: number
  }
}

export function PricingConfig() {
  const [settings, setSettings] = useState<PricingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')

      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings.pricing_config || getDefaultSettings())
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setSettings(getDefaultSettings())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultSettings = (): PricingSettings => ({
    basePricesSOL: {
      bronze: 0.01,
      silver: 0.025,
      gold: 0.06,
      diamond: 0.15,
      mythic: 0.40
    },
    capsSOL: { min: 0.005, max: 1.50 },
    weights: {
      viewers: 0.35,
      gas24h: 0.45,
      donations24h: 0.10,
      demand: 0.10
    },
    normalizers: {
      viewers: { p50: 300, p90: 3000 },
      gas24h: { p50: 10, p90: 150 },
      donations24h: { p50: 2, p90: 25 }
    },
    surge: {
      windowMin: 15,
      thresholdMints: 25,
      maxMultiplier: 1.75,
      cooldownMin: 10
    }
  })

  const saveSettings = async () => {
    if (!settings) return

    try {
      setSaving(true)
      const response = await fetch('/api/admin/settings/pricing_config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value: settings })
      })

      if (response.ok) {
        console.log('Settings saved successfully')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateBasePrices = (tier: string, value: number) => {
    if (!settings) return
    setSettings({
      ...settings,
      basePricesSOL: {
        ...settings.basePricesSOL,
        [tier]: value
      }
    })
  }

  const updateWeights = (metric: string, value: number) => {
    if (!settings) return
    setSettings({
      ...settings,
      weights: {
        ...settings.weights,
        [metric]: value
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-pump-green border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load pricing configuration</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <DollarSign className="w-5 h-5 text-pump-green" />
          <h2 className="text-xl font-bold text-white">Pricing Configuration</h2>
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center space-x-2 bg-pump-green text-black px-4 py-2 rounded-lg font-semibold hover:bg-pump-green/80 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Base Tier Prices (SOL)</h3>
          <div className="space-y-4">
            {Object.entries(settings.basePricesSOL).map(([tier, price]) => (
              <div key={tier} className="flex items-center justify-between">
                <label className="text-gray-300 capitalize">{tier}</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={price}
                  onChange={(e) => updateBasePrices(tier, parseFloat(e.target.value) || 0)}
                  className="w-24 bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white focus:outline-none focus:border-pump-green"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Price Caps (SOL)</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-300">Minimum</label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={settings.capsSOL.min}
                onChange={(e) => setSettings({
                  ...settings,
                  capsSOL: { ...settings.capsSOL, min: parseFloat(e.target.value) || 0 }
                })}
                className="w-24 bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white focus:outline-none focus:border-pump-green"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-gray-300">Maximum</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={settings.capsSOL.max}
                onChange={(e) => setSettings({
                  ...settings,
                  capsSOL: { ...settings.capsSOL, max: parseFloat(e.target.value) || 0 }
                })}
                className="w-24 bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white focus:outline-none focus:border-pump-green"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Metric Weights</h3>
          <div className="space-y-4">
            {Object.entries(settings.weights).map(([metric, weight]) => (
              <div key={metric} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-gray-300 capitalize">{metric}</label>
                  <span className="text-white font-mono">{weight.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weight}
                  onChange={(e) => updateWeights(metric, parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Surge Pricing</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-300">Window (minutes)</label>
              <input
                type="number"
                min="1"
                value={settings.surge.windowMin}
                onChange={(e) => setSettings({
                  ...settings,
                  surge: { ...settings.surge, windowMin: parseInt(e.target.value) || 15 }
                })}
                className="w-20 bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white focus:outline-none focus:border-pump-green"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-gray-300">Mint Threshold</label>
              <input
                type="number"
                min="1"
                value={settings.surge.thresholdMints}
                onChange={(e) => setSettings({
                  ...settings,
                  surge: { ...settings.surge, thresholdMints: parseInt(e.target.value) || 25 }
                })}
                className="w-20 bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white focus:outline-none focus:border-pump-green"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-gray-300">Max Multiplier</label>
              <input
                type="number"
                step="0.1"
                min="1"
                value={settings.surge.maxMultiplier}
                onChange={(e) => setSettings({
                  ...settings,
                  surge: { ...settings.surge, maxMultiplier: parseFloat(e.target.value) || 1.75 }
                })}
                className="w-20 bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white focus:outline-none focus:border-pump-green"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}