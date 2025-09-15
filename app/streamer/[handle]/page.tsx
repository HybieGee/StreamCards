import { StreamerProfile } from '@/components/streamer/StreamerProfile'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export async function generateStaticParams() {
  // For static export, we'll generate paths for popular streamers
  // In production, this could fetch from API
  return [
    { handle: 'cryptoqueen' },
    { handle: 'pumpking' },
    { handle: 'nftcollector' },
  ]
}

interface StreamerPageProps {
  params: Promise<{
    handle: string
  }>
}

export default async function StreamerPage({ params }: StreamerPageProps) {
  const { handle } = await params

  return (
    <main className="min-h-screen">
      <Header />
      <StreamerProfile handle={handle} />
      <Footer />
    </main>
  )
}