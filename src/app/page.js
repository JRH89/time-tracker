import UserDashboard from './components/UserDashboard'
import Footer from './components/Footer'

export default function Home() {
  return (
    <main className="flex flex-col">
      <UserDashboard />
      <Footer />
    </main>
  )
}
