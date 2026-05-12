import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Download, Phone, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

// Disable static generation
export const dynamic = 'force-dynamic'

const mockCalls = [
  {
    id: "1",
    leadName: "John Smith",
    duration: 245,
    outcome: "connected" as const,
    recordingUrl: "https://example.com/recording1.mp3",
    status: "completed" as const,
    timestamp: "2024-01-15 14:30:00"
  },
  {
    id: "2",
    leadName: "Sarah Johnson",
    duration: 0,
    outcome: "not_connected" as const,
    recordingUrl: null,
    status: "completed" as const,
    timestamp: "2024-01-15 14:25:00"
  },
  {
    id: "3",
    leadName: "Mike Davis",
    duration: 0,
    outcome: "voicemail" as const,
    recordingUrl: null,
    status: "completed" as const,
    timestamp: "2024-01-15 14:20:00"
  },
  {
    id: "4",
    leadName: "Emily Wilson",
    duration: 387,
    outcome: "callback_requested" as const,
    recordingUrl: "https://example.com/recording4.mp3",
    status: "completed" as const,
    timestamp: "2024-01-15 14:15:00"
  },
  {
    id: "5",
    leadName: "Robert Brown",
    duration: 156,
    outcome: "connected" as const,
    recordingUrl: "https://example.com/recording5.mp3",
    status: "in_progress" as const,
    timestamp: "2024-01-15 14:10:00"
  }
]

const getOutcomeIcon = (outcome: string) => {
  switch (outcome) {
    case "connected":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "not_connected":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "voicemail":
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    case "callback_requested":
      return <Phone className="h-4 w-4 text-blue-500" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />
  }
}

const getOutcomeColor = (outcome: string) => {
  switch (outcome) {
    case "connected":
      return "bg-green-100 text-green-800"
    case "not_connected":
      return "bg-red-100 text-red-800"
    case "voicemail":
      return "bg-yellow-100 text-yellow-800"
    case "callback_requested":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800"
    case "in_progress":
      return "bg-blue-100 text-blue-800"
    case "scheduled":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export default function CallsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calls</h1>
            <p className="text-muted-foreground">
              Monitor and manage all AI voice calls.
            </p>
          </div>
          <Button className="glass-effect">
            <Phone className="mr-2 h-4 w-4" />
            New Call
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Recording</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCalls.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell className="font-medium">{call.leadName}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDuration(call.duration)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getOutcomeIcon(call.outcome)}
                        <Badge className={getOutcomeColor(call.outcome)}>
                          {call.outcome.replace('_', ' ').charAt(0).toUpperCase() + 
                           call.outcome.replace('_', ' ').slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {call.recordingUrl ? (
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No recording</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(call.status)}>
                        {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{call.timestamp}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
