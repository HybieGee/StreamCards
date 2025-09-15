'use client'

interface StatsData {
  ts: number
  viewers: number
  gas_sol: number
  donations_sol: number
  volume_sol: number
}

interface StatsChartProps {
  data: StatsData[]
}

export function StatsChart({ data }: StatsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        No performance data available
      </div>
    )
  }

  const maxViewers = Math.max(...data.map(d => d.viewers))
  const maxGas = Math.max(...data.map(d => d.gas_sol))

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-gray-400 mb-3">Viewer Count (24h)</h4>
        <div className="h-32 relative">
          <div className="absolute inset-0 flex items-end space-x-1">
            {data.slice(-24).map((point, index) => {
              const height = maxViewers > 0 ? (point.viewers / maxViewers) * 100 : 0
              return (
                <div
                  key={index}
                  className="flex-1 bg-pump-green/60 hover:bg-pump-green transition-colors rounded-t"
                  style={{ height: `${height}%` }}
                  title={`${formatTime(point.ts)}: ${point.viewers} viewers`}
                />
              )
            })}
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{data.length > 0 ? formatTime(data[0].ts) : ''}</span>
          <span>{data.length > 0 ? formatTime(data[data.length - 1].ts) : ''}</span>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-400 mb-3">Gas Usage (24h)</h4>
        <div className="h-32 relative">
          <div className="absolute inset-0 flex items-end space-x-1">
            {data.slice(-24).map((point, index) => {
              const height = maxGas > 0 ? (point.gas_sol / maxGas) * 100 : 0
              return (
                <div
                  key={index}
                  className="flex-1 bg-electric-blue/60 hover:bg-electric-blue transition-colors rounded-t"
                  style={{ height: `${height}%` }}
                  title={`${formatTime(point.ts)}: ${point.gas_sol.toFixed(3)} SOL`}
                />
              )
            })}
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{data.length > 0 ? formatTime(data[0].ts) : ''}</span>
          <span>{data.length > 0 ? formatTime(data[data.length - 1].ts) : ''}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
        <div className="text-center">
          <div className="text-lg font-bold text-pump-green">
            {data.reduce((sum, d) => sum + d.viewers, 0) / data.length | 0}
          </div>
          <div className="text-xs text-gray-400">Avg Viewers</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-electric-blue">
            {data.reduce((sum, d) => sum + d.gas_sol, 0).toFixed(2)}
          </div>
          <div className="text-xs text-gray-400">Total Gas</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-neon-pink">
            {data.reduce((sum, d) => sum + d.donations_sol, 0).toFixed(2)}
          </div>
          <div className="text-xs text-gray-400">Donations</div>
        </div>
      </div>
    </div>
  )
}