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
      }
      leads: {
        Row: {
          id: string
          organization_id: string
          name: string
          phone: string
          status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
          loan_amount: number
          assigned_agent: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id: string
          name: string
          phone: string
          status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
          loan_amount: number
          assigned_agent: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          phone?: string
          status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
          loan_amount?: number
          assigned_agent?: string
          created_at?: string
          updated_at?: string
        }
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
          created_at?: string
          updated_at?: string
        }
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
      }
    }
  }
}
