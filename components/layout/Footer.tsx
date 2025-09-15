import { Zap } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-deep-black border-t border-pump-green/20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="h-8 w-8 text-pump-green" />
              <span className="text-2xl font-bold text-glow text-pump-green">
                PumpCards
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              Dynamic NFT trading cards for the Pump.fun streaming meta.
              Collect, trade, and watch your cards evolve with real-time performance.
            </p>
            <p className="text-sm text-gray-500">
              Built on Solana with Metaplex NFTs
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-pump-green transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-pump-green transition-colors">Tier System</a></li>
              <li><a href="#" className="hover:text-pump-green transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-pump-green transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Community</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-pump-green transition-colors">Discord</a></li>
              <li><a href="#" className="hover:text-pump-green transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-pump-green transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-pump-green transition-colors">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-pump-green/20 mt-8 pt-8 text-center text-gray-500">
          <p>&copy; 2024 PumpCards. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}