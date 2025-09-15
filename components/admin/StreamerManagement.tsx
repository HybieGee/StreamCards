'use client'

import { useState, useEffect } from 'react'
import { Check, X, Play, Users, Eye, TrendingUp } from 'lucide-react'

interface Streamer {
  id: string
  handle: string
  token_ca?: string
  avatar_url?: string
  is_approved: number
  created_at: number
  avg_viewers: number
  gas_24h: number
  donations_24h: number
}

export function StreamerManagement() {
  const [streamers, setStreamers] = useState<Streamer[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved'>('pending')
  const [discovering, setDiscovering] = useState(false)

  useEffect(() => {
    fetchStreamers()
  }, [filter])

  const fetchStreamers = async () => {
    try {
      setLoading(true)
      const status = filter === 'approved' ? 'approved' : 'pending'
      const response = await fetch(`/api/admin/streamers?status=${status}`)

      if (response.ok) {
        const data = await response.json()
        setStreamers(data.streamers || [])
      }
    } catch (error) {
      console.error('Error fetching streamers:', error)
    } finally {
      setLoading(false)
    }
  }

  const approveStreamer = async (streamerId: string) => {
    try {
      const response = await fetch(`/api/admin/streamers/${streamerId}/approve`, {
        method: 'PUT'
      })

      if (response.ok) {
        setStreamers(prev => prev.filter(s => s.id !== streamerId))
      }
    } catch (error) {
      console.error('Error approving streamer:', error)
    }
  }

  const deleteStreamer = async (streamerId: string) => {
    try {
      const response = await fetch(`/api/admin/streamers/${streamerId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setStreamers(prev => prev.filter(s => s.id !== streamerId))
      }
    } catch (error) {
      console.error('Error deleting streamer:', error)
    }
  }

  const triggerDiscovery = async () => {
    try {
      setDiscovering(true)
      const response = await fetch('/api/admin/discovery/trigger', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Discovery results:', data)

        if (filter === 'pending') {
          fetchStreamers()
        }
      }
    } catch (error) {
      console.error('Error triggering discovery:', error)
    } finally {
      setDiscovering(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-pump-green text-black'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Pending ({streamers.length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'approved'
                ? 'bg-pump-green text-black'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Approved
          </button>
        </div>

        <button
          onClick={triggerDiscovery}
          disabled={discovering}
          className="flex items-center space-x-2 bg-electric-blue text-black px-4 py-2 rounded-lg font-semibold hover:bg-electric-blue/80 transition-colors disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          <span>{discovering ? 'Discovering...' : 'Run Discovery'}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-pump-green border-t-transparent rounded-full" />
        </div>
      ) : streamers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">
            {filter === 'pending' ? 'No pending streamers' : 'No approved streamers'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {streamers.map(streamer => (
            <div
              key={streamer.id}
              className="bg-gray-900/50 border border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">
                      {streamer.handle.slice(0, 2).toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      @{streamer.handle}
                    </h3>
                    <div className="text-sm text-gray-400">
                      {streamer.token_ca ? (
                        <span>Token: {streamer.token_ca.slice(0, 8)}...</span>
                      ) : (
                        <span>No token address</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Added: {formatDate(streamer.created_at)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3 text-gray-400" />
                        <span>{streamer.avg_viewers}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3 text-gray-400" />
                        <span>{streamer.gas_24h.toFixed(2)} SOL</span>
                      </div>
                    </div>
                  </div>

                  {filter === 'pending' ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => approveStreamer(streamer.id)}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteStreamer(streamer.id)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        title="Delete"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-green-400">
                      <Check className="w-4 h-4" />
                      <span className="text-sm">Approved</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}