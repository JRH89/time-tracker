import Image from 'next/image'
import UserDashboard from './components/UserDashboard'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <UserDashboard />
    </main>
  )
}
