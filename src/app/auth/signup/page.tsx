"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, UserPlus, Check, X } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    firstName: "",
    lastName: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email) newErrors.email = "Email is required"
    if (!formData.password) newErrors.password = "Password is required"
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    if (!formData.businessName) newErrors.businessName = "Business name is required"
    if (!formData.firstName) newErrors.firstName = "First name is required"
    if (!formData.lastName) newErrors.lastName = "Last name is required"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateUniqueSlug = (businessName: string): string => {
      const baseSlug = businessName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const timestamp = Date.now().toString().slice(-6)
      return `${baseSlug}-${timestamp}`
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      const supabase = createClient()
      
      // Generate unique slug to avoid conflicts
      const uniqueSlug = generateUniqueSlug(formData.businessName)
      
      // Create organization first
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: formData.businessName,
          slug: uniqueSlug,
        })
        .select()
        .single()

      if (orgError) {
        console.error("Organization creation error:", orgError)
        throw new Error(`Failed to create organization: ${orgError.message}`)
      }

      // Create user with organization
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            organization_id: orgData.id,
          }
        }
      })

      if (userError) {
        console.error("User creation error:", userError)
        throw new Error(`Failed to create user: ${userError.message}`)
      }

      // Create user record in users table
      if (userData.user) {
        const { error: userRecordError } = await supabase
          .from('users')
          .insert({
            id: userData.user.id,
            email: formData.email,
            organization_id: orgData.id,
            business_name: formData.businessName,
            support_email: formData.email,
          })

        if (userRecordError) {
          console.error("User record creation error:", userRecordError)
          throw new Error(`Failed to create user record: ${userRecordError.message}`)
        }
      }

      console.log("Signup successful:", { userData, orgData })
      
      // Check if email confirmation is required
      if (userData.user && !userData.user.email_confirmed_at) {
        // Show success message and redirect to login
        alert("Account created successfully! Please check your email to verify your account.")
        router.push('/auth/login')
      } else {
        // Auto-login if email confirmation not required
        router.push('/dashboard')
        router.refresh()
      }
      
    } catch (error) {
      console.error("Signup error:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during signup"
      setErrors({ general: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
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
          <CardTitle className="text-2xl text-center">Create account</CardTitle>
          <CardDescription className="text-center">
            Start your AI voice journey today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                placeholder="Acme Financial Services"
                value={formData.businessName}
                onChange={(e) => handleInputChange("businessName", e.target.value)}
                className={errors.businessName ? "border-red-500" : ""}
              />
              {errors.businessName && (
                <p className="text-sm text-red-500">{errors.businessName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
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
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="rounded border-gray-300"
                  required
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create account
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-blue-600 hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
