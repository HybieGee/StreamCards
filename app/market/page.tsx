import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Marketplace } from '@/components/market/Marketplace'

export default function MarketPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Marketplace />
      <Footer />
    </main>
  )
}