import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MyCollection } from '@/components/collection/MyCollection'

export default function MyPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <MyCollection />
      <Footer />
    </main>
  )
}