import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletProvider } from '@/components/providers/WalletProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PumpCards - Collectible Streamer Trading Cards',
  description: 'Dynamic NFT trading cards for Pump.fun streamers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-deep-black text-white`}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  )
}