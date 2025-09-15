import { StreamerProfile } from '@/components/streamer/StreamerProfile'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

interface StreamerPageProps {
  params: {
    handle: string
  }
}

export default function StreamerPage({ params }: StreamerPageProps) {
  return (
    <main className="min-h-screen">
      <Header />
      <StreamerProfile handle={params.handle} />
      <Footer />
    </main>
  )
}