import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          organization_id: string
          business_name: string
          support_email: string
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          organization_id: string
          business_name: string
          support_email: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          organization_id?: string
          business_name?: string
          support_email?: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          organization_id: string
          name: string
          first_name: string
          last_name: string
          email?: string | null
          phone: string
          status:
            | 'new'
            | 'contacted'
            | 'qualified'
            | 'converted'
            | 'lost'
            | 'new_lead'
            | 'called'
            | 'interested'
            | 'application_sent'
            | 'application_completed'
            | 'transferred'
            | 'approved'
            | 'rejected'
          loan_amount: number
          assigned_agent: string
          notes?: string | null
          application_status?: Record<string, unknown> | null
          property_address?: string | null
          property_value?: number | null
          credit_score?: number | null
          income?: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone: string
          status?:
            | 'new'
            | 'contacted'
            | 'qualified'
            | 'converted'
            | 'lost'
            | 'new_lead'
            | 'called'
            | 'interested'
            | 'application_sent'
            | 'application_completed'
            | 'transferred'
            | 'approved'
            | 'rejected'
          loan_amount: number
          assigned_agent?: string
          notes?: string | null
          application_status?: Record<string, unknown> | null
          property_address?: string | null
          property_value?: number | null
          credit_score?: number | null
          income?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string
          status?:
            | 'new'
            | 'contacted'
            | 'qualified'
            | 'converted'
            | 'lost'
            | 'new_lead'
            | 'called'
            | 'interested'
            | 'application_sent'
            | 'application_completed'
            | 'transferred'
            | 'approved'
            | 'rejected'
          loan_amount?: number
          assigned_agent?: string
          notes?: string | null
          application_status?: Record<string, unknown> | null
          property_address?: string | null
          property_value?: number | null
          credit_score?: number | null
          income?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      calls: {
        Row: {
          id: string
          organization_id: string
          lead_id: string
          duration: number
          outcome: 'connected' | 'not_connected' | 'voicemail' | 'callback_requested'
          recording_url: string | null
          status: 'completed' | 'in_progress' | 'scheduled'
          transcript: string | null
          timestamp: string
          external_call_id?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id: string
          lead_id: string
          duration: number
          outcome: 'connected' | 'not_connected' | 'voicemail' | 'callback_requested'
          recording_url?: string | null
          status?: 'completed' | 'in_progress' | 'scheduled'
          transcript?: string | null
          timestamp: string
          external_call_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          lead_id?: string
          duration?: number
          outcome?: 'connected' | 'not_connected' | 'voicemail' | 'callback_requested'
          recording_url?: string | null
          status?: 'completed' | 'in_progress' | 'scheduled'
          transcript?: string | null
          timestamp?: string
          external_call_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      recordings: {
        Row: {
          id: string
          organization_id: string
          call_id: string
          file_url: string
          file_name: string
          file_size: number
          duration: number
          created_at: string
        }
        Insert: {
          id: string
          organization_id: string
          call_id: string
          file_url: string
          file_name: string
          file_size: number
          duration: number
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          call_id?: string
          file_url?: string
          file_name?: string
          file_size?: number
          duration?: number
          created_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          status: 'active' | 'paused' | 'completed'
          total_leads: number
          connected_calls: number
          conversion_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id: string
          name: string
          description?: string | null
          status?: 'active' | 'paused' | 'completed'
          total_leads: number
          connected_calls: number
          conversion_rate: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          status?: 'active' | 'paused' | 'completed'
          total_leads?: number
          connected_calls?: number
          conversion_rate?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      billing: {
        Row: {
          id: string
          organization_id: string
          plan_type: 'starter' | 'pro' | 'enterprise'
          status: 'active' | 'cancelled' | 'past_due'
          current_period_start: string
          current_period_end: string
          amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id: string
          plan_type: 'starter' | 'pro' | 'enterprise'
          status?: 'active' | 'cancelled' | 'past_due'
          current_period_start: string
          current_period_end: string
          amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          plan_type?: 'starter' | 'pro' | 'enterprise'
          status?: 'active' | 'cancelled' | 'past_due'
          current_period_start?: string
          current_period_end?: string
          amount?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          id: string
          event_type: string
          user_id?: string | null
          organization_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          endpoint?: string | null
          details?: Record<string, unknown> | null
          severity: string
          timestamp: string
        }
        Insert: {
          id?: string
          event_type: string
          user_id?: string | null
          organization_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          endpoint?: string | null
          details?: Record<string, unknown> | null
          severity: string
          timestamp?: string
        }
        Update: {
          id?: string
          event_type?: string
          user_id?: string | null
          organization_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          endpoint?: string | null
          details?: Record<string, unknown> | null
          severity?: string
          timestamp?: string
        }
        Relationships: []
      }
      lead_status_logs: {
        Row: {
          id: string
          lead_id: string
          organization_id: string
          old_status: string | null
          new_status: string
          notes: string | null
          changed_by: string
          changed_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          organization_id: string
          old_status?: string | null
          new_status: string
          notes?: string | null
          changed_by: string
          changed_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          organization_id?: string
          old_status?: string | null
          new_status?: string
          notes?: string | null
          changed_by?: string
          changed_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
