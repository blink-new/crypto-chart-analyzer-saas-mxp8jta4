import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Upload, BarChart3, Target, Shield, Zap } from "lucide-react"
import { blink } from "@/blink/client"

export function LandingPage() {
  const handleGetStarted = () => {
    blink.auth.login()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AI-Powered Crypto Chart Analysis
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Upload cryptocurrency charts or select trading pairs to get instant AI-generated trade setups with precise entry points, stop-loss, and take-profit levels.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="px-8 py-3 text-lg"
              >
                Get Started Free
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-3 text-lg"
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Professional Trading Analysis
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Advanced AI algorithms analyze your charts and market data to provide actionable trading insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Chart Upload & Analysis</CardTitle>
                <CardDescription>
                  Upload any cryptocurrency chart image and get instant AI-powered technical analysis
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Live Market Data</CardTitle>
                <CardDescription>
                  Select from hundreds of crypto trading pairs and analyze real-time market data
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Precise Trade Setups</CardTitle>
                <CardDescription>
                  Get exact entry points, stop-loss levels, and multiple take-profit targets
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your trading data and analysis remain completely private and secure
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Instant Results</CardTitle>
                <CardDescription>
                  Get comprehensive trading analysis in seconds, not hours
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Professional Grade</CardTitle>
                <CardDescription>
                  Built for serious traders who demand accuracy and reliability
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Elevate Your Trading?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of traders using AI-powered analysis to make better trading decisions
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={handleGetStarted}
            className="px-8 py-3 text-lg bg-white text-primary hover:bg-gray-50"
          >
            Start Analyzing Charts Now
          </Button>
        </div>
      </section>
    </div>
  )
}