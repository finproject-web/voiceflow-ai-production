"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  BarChart3, 
  Users, 
  Phone, 
  FileAudio, 
  TrendingUp, 
  CreditCard, 
  Settings,
  Home
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Leads", href: "/dashboard/leads", icon: Users },
  { name: "Calls", href: "/dashboard/calls", icon: Phone },
  { name: "Recordings", href: "/dashboard/recordings", icon: FileAudio },
  { name: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center pl-3 mb-14">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VoiceFlow AI
            </h2>
          </div>
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 transition-transform duration-200",
                      isActive ? "scale-110" : "group-hover:scale-110"
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
