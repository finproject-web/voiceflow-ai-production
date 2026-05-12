"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Disable static generation
export const dynamic = 'force-dynamic'

export default function LeadsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Leads Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Leads management interface will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
