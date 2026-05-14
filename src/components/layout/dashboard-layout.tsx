"use client"

import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { NotificationCenter } from "@/components/notification-center"

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: {
    email?: string
    name?: string
    avatar_url?: string
  }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar className="fixed left-0 top-0 h-screen border-r" />
        <div className="flex-1 ml-64">
          <Header user={user}>
            <NotificationCenter />
          </Header>
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
