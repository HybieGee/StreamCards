'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/hooks/useWallet'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Settings, Users, TrendingUp, Zap, Activity, Shield } from 'lucide-react'
import { StreamerManagement } from './StreamerManagement'
import { PricingConfig } from './PricingConfig'
import { TierManagement } from './TierManagement'
import { SystemStatus } from './SystemStatus'

type AdminTab = 'streamers' | 'pricing' | 'tiers' | 'status'

export function AdminDashboard() {
  const { connected } = useWallet()
  const [activeTab, setActiveTab] = useState<AdminTab>('streamers')

  if (!connected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">
            Admin Access Required
          </h1>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Connect your wallet to access the admin dashboard.
          </p>
          <WalletMultiButton className="!bg-pump-green !text-black hover:!bg-pump-green/80 !transition-all !rounded-lg !text-lg !px-8 !py-4" />
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'streamers' as AdminTab, label: 'Streamers', icon: Users },
    { id: 'pricing' as AdminTab, label: 'Pricing', icon: TrendingUp },
    { id: 'tiers' as AdminTab, label: 'Tiers', icon: Zap },
    { id: 'status' as AdminTab, label: 'System', icon: Activity }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pump-green to-electric-blue bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-gray-400 text-lg">
          Manage PumpCards system configuration and operations
        </p>
      </div>

      <div className="bg-deep-black/80 border border-pump-green/20 rounded-lg overflow-hidden">
        <div className="border-b border-pump-green/20">
          <nav className="flex space-x-0">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-pump-green text-pump-green bg-pump-green/5'
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'streamers' && <StreamerManagement />}
          {activeTab === 'pricing' && <PricingConfig />}
          {activeTab === 'tiers' && <TierManagement />}
          {activeTab === 'status' && <SystemStatus />}
        </div>
      </div>
    </div>
  )
}