"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface HeaderProps {
  user?: {
    email?: string
    name?: string
    avatar_url?: string
  }
  children?: React.ReactNode
}

export function Header({ user, children }: HeaderProps) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState("")

  const handleSignOut = async () => {
    setIsSigningOut(true)
    setSignOutError("")
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      // Clear all Supabase cookies
      await supabase.auth.signOut({ scope: 'global' })
      
      // Navigate to login and refresh to clear session
      router.replace("/auth/login")
      router.refresh()
    } catch (error) {
      console.error("Sign out error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to sign out"
      setSignOutError(errorMessage)
      setIsSigningOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {children}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar_url} alt={user?.name} />
                    <AvatarFallback>
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {signOutError && (
                  <div className="px-2 py-1 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded">
                    {signOutError}
                  </div>
                )}
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  disabled={isSigningOut}
                  className={isSigningOut ? "opacity-50 cursor-not-allowed" : ""}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isSigningOut ? "Signing out..." : "Log out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  )
}
