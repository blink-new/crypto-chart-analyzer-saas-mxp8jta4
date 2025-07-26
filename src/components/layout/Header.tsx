import { Button } from "@/components/ui/button"
import { TrendingUp, User } from "lucide-react"
import { blink } from "@/blink/client"
import { useState, useEffect } from "react"

export function Header() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleSignOut = () => {
    blink.auth.logout()
  }

  if (loading) {
    return (
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <span className="text-xl font-semibold text-gray-900">CryptoChart Pro</span>
            </div>
            <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold text-gray-900">CryptoChart Pro</span>
          </div>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          ) : (
            <Button onClick={() => blink.auth.login()}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}