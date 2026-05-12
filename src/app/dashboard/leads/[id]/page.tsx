"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

// Disable static generation
export const dynamic = 'force-dynamic'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AudioPlayer } from "@/components/ui/audio-player"
import { 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  Clock,
  User,
  ArrowLeft,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"

interface LeadDetails {
  id: string
  name: string
  phone: string
  email?: string
  status: string
  loan_amount: number
  assigned_agent: string
  created_at: string
  updated_at: string
  notes?: string
  calls: Array<{
    id: string
    duration: number
    outcome: string
    status: string
    timestamp: string
    recording_url?: string
    transcript?: string
  }>
  sms_history: Array<{
    id: string
    message: string
    status: string
    sent_at: string
    delivered_at?: string
  }>
  application_status?: {
    status: string
    documents: string[]
    submitted_at?: string
    approved_at?: string
    rejected_at?: string
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "new_lead":
      return "bg-blue-100 text-blue-800"
    case "called":
      return "bg-yellow-100 text-yellow-800"
    case "interested":
      return "bg-purple-100 text-purple-800"
    case "application_sent":
      return "bg-orange-100 text-orange-800"
    case "application_completed":
      return "bg-green-100 text-green-800"
    case "transferred":
      return "bg-indigo-100 text-indigo-800"
    case "approved":
      return "bg-emerald-100 text-emerald-800"
    case "rejected":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export default function LeadDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [lead, setLead] = useState<LeadDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'calls' | 'sms' | 'application'>('calls')

  useEffect(() => {
    if (params.id) {
      fetchLeadDetails(params.id as string)
    }
  }, [params.id])

  const fetchLeadDetails = async (leadId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/leads/${leadId}`)
      const data = await response.json()
      
      if (data.success) {
        setLead(data.data)
      } else {
        console.error('Failed to fetch lead details:', data.error)
      }
    } catch (error) {
      console.error('Error fetching lead details:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateLeadStatus = async (newStatus: string) => {
    if (!lead) return

    try {
      const response = await fetch(`/api/leads/${lead.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()
      if (data.success) {
        setLead(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (error) {
      console.error('Error updating lead status:', error)
    }
  }

  const uploadDocument = async (file: File) => {
    if (!lead) return

    const formData = new FormData()
    formData.append('document', file)
    formData.append('leadId', lead.id)

    try {
      const response = await fetch('/api/leads/upload-document', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        // Refresh lead details to show new document
        fetchLeadDetails(lead.id)
      }
    } catch (error) {
      console.error('Error uploading document:', error)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!lead) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Lead not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Leads
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Lead Details</h1>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => updateLeadStatus('called')}>
              Mark as Called
            </Button>
            <Button onClick={() => updateLeadStatus('application_sent')}>
              Send Application
            </Button>
          </div>
        </div>

        {/* Lead Information */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <p className="text-lg">{lead.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p>{lead.phone}</p>
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {lead.email && (
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{lead.email}</p>
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Status</label>
                <Badge className={getStatusColor(lead.status)}>
                  {lead.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium">Loan Amount</label>
                <p className="text-lg font-semibold">{formatCurrency(lead.loan_amount)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Assigned Agent</label>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p>{lead.assigned_agent}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Created</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p>{new Date(lead.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lead.application_status ? (
                <>
                  <div>
                    <label className="text-sm font-medium">Current Status</label>
                    <Badge className={
                      lead.application_status.status === 'approved' ? 'bg-green-100 text-green-800' :
                      lead.application_status.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {lead.application_status.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {lead.application_status.submitted_at && (
                    <div>
                      <label className="text-sm font-medium">Submitted</label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p>{new Date(lead.application_status.submitted_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}

                  {lead.application_status.approved_at && (
                    <div>
                      <label className="text-sm font-medium">Approved</label>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p>{new Date(lead.application_status.approved_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}

                  {lead.application_status.rejected_at && (
                    <div>
                      <label className="text-sm font-medium">Rejected</label>
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <p>{new Date(lead.application_status.rejected_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}

                  {lead.application_status.documents && lead.application_status.documents.length > 0 && (
                    <div>
                      <label className="text-sm font-medium">Documents</label>
                      <div className="space-y-2">
                        {lead.application_status.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>{doc}</span>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No application submitted yet</p>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Documents
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {lead.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{lead.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Tabs for History */}
        <Card>
          <CardHeader>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('calls')}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === 'calls' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Call History
              </button>
              <button
                onClick={() => setActiveTab('sms')}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === 'sms' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                SMS History
              </button>
              <button
                onClick={() => setActiveTab('application')}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === 'application' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Application Timeline
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {activeTab === 'calls' && (
              <div className="space-y-4">
                {lead.calls && lead.calls.length > 0 ? (
                  lead.calls.map((call) => (
                    <div key={call.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">Call with {call.outcome}</h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDuration(call.duration)}</span>
                            </div>
                            <span>{new Date(call.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <Badge className={
                          call.status === 'completed' ? 'bg-green-100 text-green-800' :
                          call.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {call.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      {call.transcript && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <h5 className="font-medium mb-2">Transcript</h5>
                          <p className="text-sm">{call.transcript}</p>
                        </div>
                      )}
                      {call.recording_url && (
                        <div className="mt-3">
                          <AudioPlayer
                            src={call.recording_url}
                            title={`Call with ${call.outcome}`}
                            onDownload={() => window.open(call.recording_url, '_blank')}
                          />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No calls recorded</p>
                )}
              </div>
            )}

            {activeTab === 'sms' && (
              <div className="space-y-4">
                {lead.sms_history && lead.sms_history.length > 0 ? (
                  lead.sms_history.map((sms) => (
                    <div key={sms.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">SMS Message</h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{new Date(sms.sent_at).toLocaleString()}</span>
                            <Badge className={
                              sms.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              sms.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {sms.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <p className="text-sm">{sms.message}</p>
                      </div>
                      {sms.delivered_at && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Delivered: {new Date(sms.delivered_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No SMS messages sent</p>
                )}
              </div>
            )}

            {activeTab === 'application' && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Application Timeline</h3>
                  <p className="text-muted-foreground">
                    Track application status, document uploads, and approval workflow
                  </p>
                  <Button className="mt-4">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Documents
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
