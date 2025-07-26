import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { LandingPage } from '@/components/pages/LandingPage'
import { Dashboard } from '@/components/pages/Dashboard'
import { blink } from '@/blink/client'

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <div className="w-8 h-8 bg-primary rounded-full"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Loading CryptoChart Pro...</h2>
          <p className="text-gray-600">Initializing your trading dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {user ? <Dashboard user={user} /> : <LandingPage />}
    </div>
  )
}

export default App