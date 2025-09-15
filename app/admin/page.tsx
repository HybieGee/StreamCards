import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export default function AdminPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <AdminDashboard />
      <Footer />
    </main>
  )
}