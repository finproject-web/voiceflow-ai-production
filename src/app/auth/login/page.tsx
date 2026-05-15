"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Check for error in URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlError = urlParams.get('error')
    if (urlError === 'no_organization') {
      setError('Your account is not properly set up. Please contact support or sign up again.')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      console.log("Login successful:", data)
      
      // Check if user has organization
      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('organization_id')
          .eq('id', data.user.id)
          .single()

        if (userError || !userData?.organization_id) {
          // Create user record if it doesn't exist
          if (userError?.code === 'PGRST116') {
            console.log("User record doesn't exist, creating it...")
            const { error: insertUserError } = await supabase
              .from('users')
              .insert({ id: data.user.id })
            
            if (insertUserError) {
              console.error("Error creating user record:", insertUserError)
              setError(`Failed to create user record: ${insertUserError.message}`)
              setIsLoading(false)
              return
            }
          }

          // Create organization for user if they don't have one
          console.log("User has no organization, creating one...")
          
          const businessName = email.split('@')[0]
          let slug = businessName.toLowerCase().replace(/\s+/g, '-')
          
          // Check if organization with this slug already exists
          const { data: existingOrg } = await supabase
            .from('organizations')
            .select('id')
            .eq('slug', slug)
            .single()

          let orgId: string
          
          if (existingOrg) {
            // Use existing organization
            console.log("Organization already exists, using it")
            orgId = existingOrg.id
          } else {
            // Create new organization with unique slug
            let attempts = 0
            let orgError = null
            let org: any = null
            
            while (attempts < 5) {
              const uniqueSlug = attempts === 0 ? slug : `${slug}-${Date.now()}`
              
              const result = await supabase
                .from('organizations')
                .insert({ name: businessName, slug: uniqueSlug })
                .select()
                .single()
              
              if (result.error) {
                orgError = result.error
                attempts++
              } else {
                org = result.data
                orgError = null
                break
              }
            }

            if (orgError || !org) {
              console.error("Error creating organization:", orgError)
              setError(`Failed to create organization: ${orgError?.message || 'Unknown error'}`)
              setIsLoading(false)
              return
            }
            
            orgId = org.id
          }

          // Update user with organization_id
          const { error: updateError } = await supabase
            .from('users')
            .update({ 
              organization_id: orgId,
              business_name: businessName 
            })
            .eq('id', data.user.id)

          if (updateError) {
            console.error("Error updating user with organization:", updateError)
            setError(`Failed to update user: ${updateError.message}`)
            setIsLoading(false)
            return
          }
        }
      }
      
      // Redirect to dashboard and refresh to update session
      router.push('/dashboard')
      router.refresh()
      
    } catch (error) {
      console.error("Login error:", error)
      const errorMessage = error instanceof Error ? error.message : "Invalid email or password"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
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
          <CardTitle className="text-2xl text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded border-gray-300"
                />
                <Label htmlFor="remember" className="text-sm">
                  Remember me
                </Label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in
                </div>
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-blue-600 hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
