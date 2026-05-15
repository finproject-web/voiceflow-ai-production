"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setError("")
    setMessage("")

    try {
      const supabase = createClient()

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/auth/reset-password`
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Password reset email sent. Please check your inbox.')
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md glass-effect">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VoiceFlow AI
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {message && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-md text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Link
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-blue-600 hover:underline flex items-center justify-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}