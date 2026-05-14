import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase'

export type LeadStatus = 
  | 'new_lead' 
  | 'called' 
  | 'interested' 
  | 'application_sent' 
  | 'application_completed' 
  | 'transferred' 
  | 'approved' 
  | 'rejected'

export type LeadFilters = {
  search?: string
  status?: LeadStatus
  dateFrom?: string
  dateTo?: string
  loanAmountMin?: number
  loanAmountMax?: number
  assignedAgent?: string
}

export interface LeadWithDetails {
  id: string
  organization_id: string
  first_name: string
  last_name: string
  email?: string
  phone: string
  status: LeadStatus
  loan_amount?: number
  property_address?: string
  property_value?: number
  credit_score?: number
  income?: number
  notes?: string
  created_at: string
  updated_at: string
  calls?: any[]
  sms_history?: any[]
  application_status?: {
    status: string
    documents: string[]
    submitted_at?: string
    approved_at?: string
    rejected_at?: string
  }
}

class LeadManagementService {
  private static supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get leads with advanced filtering
  static async getLeads(
    organizationId: string, 
    filters: LeadFilters = {},
    page = 1,
    limit = 50
  ): Promise<{ leads: LeadWithDetails[]; total: number }> {
    let query = this.supabase
      .from('leads')
      .select(`
        *,
        calls (
          id,
          duration,
          outcome,
          status,
          timestamp,
          recording_url
        ),
        sms_history (
          id,
          message,
          status,
          sent_at,
          delivered_at
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.search) {
      query = query.or(
        `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      )
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    if (filters.loanAmountMin) {
      query = query.gte('loan_amount', filters.loanAmountMin)
    }

    if (filters.loanAmountMax) {
      query = query.lte('loan_amount', filters.loanAmountMax)
    }

    // Get total count
    const { count } = await query
    const total = count || 0

    // Apply pagination
    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)

    const { data: leads, error } = await query

    if (error) {
      throw new Error(`Failed to fetch leads: ${error.message}`)
    }

    return { leads: (leads || []) as unknown as LeadWithDetails[], total }
  }

  // Update lead status with pipeline tracking
  static async updateLeadStatus(
    leadId: string, 
    organizationId: string, 
    newStatus: LeadStatus,
    notes?: string,
    assignedAgent?: string
  ): Promise<LeadWithDetails> {
    const { data: lead, error } = await this.supabase
      .from('leads')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...(notes && { notes }),
        ...(assignedAgent && { assigned_agent: assignedAgent })
      })
      .eq('id', leadId)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update lead status: ${error.message}`)
    }

    // Log status change
    await this.logStatusChange(leadId, organizationId, newStatus, notes)

    return lead! as unknown as LeadWithDetails
  }

  // Get lead details with full history
  static async getLeadDetails(leadId: string, organizationId: string): Promise<LeadWithDetails | null> {
    const { data: lead, error } = await this.supabase
      .from('leads')
      .select(`
        *,
        calls (
          id,
          duration,
          outcome,
          status,
          timestamp,
          recording_url,
          transcript
        ),
        sms_history (
          id,
          message,
          status,
          sent_at,
          delivered_at
        )
      `)
      .eq('id', leadId)
      .eq('organization_id', organizationId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch lead details: ${error.message}`)
    }

    return lead as unknown as LeadWithDetails | null
  }

  // Get calls for a specific lead
  static async getLeadCalls(leadId: string, organizationId: string) {
    const { data: calls, error } = await this.supabase
      .from('calls')
      .select('*')
      .eq('lead_id', leadId)
      .eq('organization_id', organizationId)
      .order('timestamp', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch lead calls: ${error.message}`)
    }

    return calls || []
  }

  // Get SMS history for a specific lead
  static async getLeadSMSHistory(leadId: string, organizationId: string) {
    const { data: smsHistory, error } = await this.supabase
      .from('sms_logs')
      .select('*')
      .eq('lead_id', leadId)
      .eq('organization_id', organizationId)
      .order('sent_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch SMS history: ${error.message}`)
    }

    return smsHistory || []
  }

  // Update application status
  static async updateApplicationStatus(
    leadId: string,
    organizationId: string,
    applicationData: {
      status: string
      documents?: string[]
      notes?: string
    }
  ): Promise<void> {
    const { error } = await this.supabase
      .from('leads')
      .update({ 
        application_status: applicationData,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)
      .eq('organization_id', organizationId)

    if (error) {
      throw new Error(`Failed to update application status: ${error.message}`)
    }
  }

  // Export leads to CSV
  static async exportLeadsToCSV(organizationId: string, filters: LeadFilters = {}): Promise<string> {
    const { leads } = await this.getLeads(organizationId, filters, 1, 10000) // Get all leads for export

    const headers = [
      'ID', 'Name', 'Phone', 'Status', 'Loan Amount', 
      'Assigned Agent', 'Created Date', 'Updated Date', 'Notes'
    ]

    const csvRows = leads.map(lead => [
      lead.id,
      `${lead.first_name} ${lead.last_name}`.trim(),
      lead.phone,
      lead.status,
      lead.loan_amount,
      '',
      lead.created_at,
      lead.updated_at,
      lead.notes || ''
    ])

    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n')

    return csvContent
  }

  // Search leads across all fields
  static async searchLeads(
    organizationId: string, 
    searchTerm: string,
    limit = 20
  ): Promise<LeadWithDetails[]> {
    const { data: leads, error } = await this.supabase
      .from('leads')
      .select('*')
      .eq('organization_id', organizationId)
      .or(
        `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`
      )
      .limit(limit)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to search leads: ${error.message}`)
    }

    return (leads || []) as unknown as LeadWithDetails[]
  }

  // Get pipeline statistics
  static async getPipelineStats(organizationId: string): Promise<{
    total: number
    byStatus: Record<LeadStatus, number>
    conversionRate: number
  }> {
    const { data: leads, error } = await this.supabase
      .from('leads')
      .select('status')
      .eq('organization_id', organizationId)

    if (error) {
      throw new Error(`Failed to fetch pipeline stats: ${error.message}`)
    }

    const total = leads?.length || 0
    const byStatus = leads?.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1
      return acc
    }, {} as Record<LeadStatus, number>)

    const conversionRate = total > 0 
      ? ((byStatus.approved || 0) / total) * 100 
      : 0

    return { total, byStatus, conversionRate }
  }

  // Private helper methods
  private static async logStatusChange(
    leadId: string, 
    organizationId: string, 
    newStatus: LeadStatus, 
    notes?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('lead_status_logs')
      .insert({
        lead_id: leadId,
        organization_id: organizationId,
        old_status: null, // Would need to fetch current status first
        new_status: newStatus,
        notes,
        changed_by: 'system', // Would be user ID in real implementation
        changed_at: new Date().toISOString()
      })

    if (error) {
      console.error('Failed to log status change:', error)
    }
  }
}

export { LeadManagementService }
