import { Zap, Github, Twitter, MessageCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-deep-black via-deep-black to-card-black border-t border-pump-green/30 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pump-green/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-electric-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <Zap className="w-10 h-10 text-pump-green" />
                <div className="absolute inset-0 bg-pump-green/20 rounded-full blur-xl" />
              </div>
              <div>
                <span className="cyber-text text-3xl bg-gradient-to-r from-pump-green to-electric-blue bg-clip-text text-transparent">
                  PumpCards
                </span>
                <div className="text-xs text-gray-400 -mt-1">Stream the Future</div>
              </div>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              Dynamic NFT trading cards for the <span className="text-pump-green font-semibold">Pump.fun</span> streaming meta.
              Collect, trade, and watch your cards evolve with real-time performance metrics.
            </p>

            <div className="flex items-center space-x-4 mb-6">
              <div className="holo-card px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-300">Built on</span>
                <span className="text-pump-green font-semibold ml-2">Solana</span>
              </div>
              <div className="holo-card px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-300">Powered by</span>
                <span className="text-electric-blue font-semibold ml-2">Metaplex</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center hover:from-pump-green/20 hover:to-pump-green/10 transition-all duration-300 group"
              >
                <Twitter className="w-5 h-5 text-gray-400 group-hover:text-pump-green" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center hover:from-electric-blue/20 hover:to-electric-blue/10 transition-all duration-300 group"
              >
                <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-electric-blue" />
              </a>
              <a
                href="https://github.com/HybieGee/StreamCards"
                className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center hover:from-neon-pink/20 hover:to-neon-pink/10 transition-all duration-300 group"
              >
                <Github className="w-5 h-5 text-gray-400 group-hover:text-neon-pink" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="cyber-text text-lg mb-6 text-pump-green">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 group">
                  <span>How it Works</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 group">
                  <span>Tier System</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 group">
                  <span>Dynamic Pricing</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 group">
                  <span>Admin Panel</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h3 className="cyber-text text-lg mb-6 text-electric-blue">Community</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 group">
                  <span>Discord Server</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 group">
                  <span>Twitter</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="https://github.com/HybieGee/StreamCards" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 group">
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 group">
                  <span>Documentation</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-pump-green/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400">
                &copy; 2024 <span className="text-pump-green font-semibold">PumpCards</span>.
                All rights reserved.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Built with ❤️ for the Solana ecosystem
              </p>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="#" className="hover:text-pump-green transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-pump-green transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-pump-green transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute bottom-10 left-10 w-2 h-2 bg-pump-green rounded-full animate-ping opacity-60" />
      <div className="absolute bottom-16 right-20 w-1 h-1 bg-electric-blue rounded-full animate-ping opacity-40" style={{ animationDelay: '1s' }} />
    </footer>
  )
}