import Image from 'next/image'
import UserDashboard from './components/UserDashboard'

export default function Home() {
  return (
    <main className="flex flex-col">
      <UserDashboard />
    </main>
  )
}
