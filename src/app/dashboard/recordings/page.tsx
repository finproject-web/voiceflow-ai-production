import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Disable static generation
export const dynamic = 'force-dynamic'
import { 
  Play, 
  Download, 
  Search, 
  Filter,
  Calendar,
  Clock,
  FileAudio,
  Mic
} from "lucide-react"

const mockRecordings = [
  {
    id: "1",
    fileName: "call_john_smith_20240115.mp3",
    leadName: "John Smith",
    duration: 245,
    fileSize: 2048576,
    callDate: "2024-01-15",
    callTime: "14:30:00",
    status: "available"
  },
  {
    id: "2",
    fileName: "call_sarah_johnson_20240115.mp3",
    leadName: "Sarah Johnson",
    duration: 387,
    fileSize: 3214567,
    callDate: "2024-01-15",
    callTime: "14:25:00",
    status: "available"
  },
  {
    id: "3",
    fileName: "call_mike_davis_20240114.mp3",
    leadName: "Mike Davis",
    duration: 156,
    fileSize: 1298765,
    callDate: "2024-01-14",
    callTime: "16:45:00",
    status: "processing"
  },
  {
    id: "4",
    fileName: "call_emily_wilson_20240114.mp3",
    leadName: "Emily Wilson",
    duration: 423,
    fileSize: 3512345,
    callDate: "2024-01-14",
    callTime: "15:20:00",
    status: "available"
  },
  {
    id: "5",
    fileName: "call_robert_brown_20240113.mp3",
    leadName: "Robert Brown",
    duration: 198,
    fileSize: 1645678,
    callDate: "2024-01-13",
    callTime: "11:30:00",
    status: "available"
  }
]

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800"
    case "processing":
      return "bg-yellow-100 text-yellow-800"
    case "error":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function RecordingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Recordings</h1>
            <p className="text-muted-foreground">
              Access and manage all your call recordings.
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Date Range
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recordings</CardTitle>
              <FileAudio className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <Mic className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2 GB</div>
              <p className="text-xs text-muted-foreground">of 10 GB</p>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3:24</div>
              <p className="text-xs text-muted-foreground">minutes</p>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground">new recordings</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Recordings</CardTitle>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search recordings..."
                    className="pl-10 pr-4 py-2 border rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>File Size</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRecordings.map((recording) => (
                  <TableRow key={recording.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <FileAudio className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-[200px]">{recording.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{recording.leadName}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDuration(recording.duration)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatFileSize(recording.fileSize)}</TableCell>
                    <TableCell>
                      <div>
                        <div>{recording.callDate}</div>
                        <div className="text-sm text-muted-foreground">{recording.callTime}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(recording.status)}>
                        {recording.status.charAt(0).toUpperCase() + recording.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={recording.status !== 'available'}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={recording.status !== 'available'}
                        >
                          <Download className="h-4 w-4" />
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
