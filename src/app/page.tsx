import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Phone, 
  Users, 
  TrendingUp, 
  BarChart3, 
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Globe
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="border-b bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            VoiceFlow AI
          </div>
          <div className="flex space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Transform Your Business with AI Voice
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Automate customer conversations, capture more leads, and boost conversion rates with our advanced AI voice platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Features for Modern Business</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to automate and scale your customer communications
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="glass-effect">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>AI Voice Calls</CardTitle>
              <CardDescription>
                Natural-sounding AI agents that handle customer conversations 24/7
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Lead Management</CardTitle>
              <CardDescription>
                Automatically capture, qualify, and route leads to your team
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Real-time insights into call performance and conversion metrics
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">2M+</div>
            <div className="text-gray-600 dark:text-gray-300">Calls Automated</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-600 mb-2">95%</div>
            <div className="text-gray-600 dark:text-gray-300">Customer Satisfaction</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-600 mb-2">3x</div>
            <div className="text-gray-600 dark:text-gray-300">Lead Conversion</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-gray-600 dark:text-gray-300">Availability</div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose VoiceFlow AI?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            The most comprehensive AI voice platform for growing businesses
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Easy Setup</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get started in minutes with our intuitive onboarding process
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Process thousands of calls simultaneously with zero latency
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Enterprise Security</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Bank-level encryption and compliance with industry standards
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Globe className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Global Scale</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Support multiple languages and regions from day one
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of companies already using VoiceFlow AI to grow their revenue
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 md:mb-0">
              VoiceFlow AI
            </div>
            <div className="flex space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-blue-600">Terms of Service</Link>
              <Link href="/contact" className="hover:text-blue-600">Contact</Link>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            © 2024 VoiceFlow AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
