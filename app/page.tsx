import { Header } from '@/components/layout/Header'
import { Hero } from '@/components/home/Hero'
import { FeaturedStreamers } from '@/components/home/FeaturedStreamers'
import { TopCards } from '@/components/home/TopCards'
import { Footer } from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <FeaturedStreamers />
      <TopCards />
      <Footer />
    </main>
  )
}