"use server"

import { createClient } from '@/utils/supabase/server'
import { Database } from './supabase'

async function getSupabase() {
  return createClient()
}

// Get authenticated user with organization context
export async function getAuthenticatedUser() {
  const supabase = await getSupabase()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  // Get user's organization details
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('organization_id, business_name')
    .eq('id', user.id)
    .single()
  
  if (profileError || !profile) {
    return null
  }
  
  return {
    user,
    organization_id: profile.organization_id,
    business_name: profile.business_name
  }
}

// Secure query wrapper that automatically scopes to organization
export async function createSecureQuery() {
  const authUser = await getAuthenticatedUser()
  
  if (!authUser) {
    throw new Error('Unauthorized: No authenticated user found')
  }
  
  const supabase = await getSupabase()
  
  return {
    supabase,
    organization_id: authUser.organization_id,
    user: authUser.user
  }
}

// Validate organization access
export async function validateOrganizationAccess(organizationId: string) {
  const authUser = await getAuthenticatedUser()
  
  if (!authUser) {
    return false
  }
  
  return authUser.organization_id === organizationId
}

// Secure lead operations
export async function getLeads() {
  const { supabase, organization_id } = await createSecureQuery()
  
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('organization_id', organization_id)
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to fetch leads: ${error.message}`)
  }
  
  return data
}

export async function createLead(leadData: Omit<Database['public']['Tables']['leads']['Insert'], 'id' | 'organization_id'>) {
  const { supabase, organization_id } = await createSecureQuery()
  
  const { data, error } = await supabase
    .from('leads')
    .insert({
      ...leadData,
      organization_id
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create lead: ${error.message}`)
  }
  
  return data
}

// Secure call operations
export async function getCalls() {
  const { supabase, organization_id } = await createSecureQuery()
  
  const { data, error } = await supabase
    .from('calls')
    .select('*')
    .eq('organization_id', organization_id)
    .order('timestamp', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to fetch calls: ${error.message}`)
  }
  
  return data
}

export async function createCall(callData: Omit<Database['public']['Tables']['calls']['Insert'], 'id' | 'organization_id'>) {
  const { supabase, organization_id } = await createSecureQuery()
  
  const { data, error } = await supabase
    .from('calls')
    .insert({
      ...callData,
      organization_id
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create call: ${error.message}`)
  }
  
  return data
}

// Secure recording operations
export async function getRecordings() {
  const { supabase, organization_id } = await createSecureQuery()
  
  const { data, error } = await supabase
    .from('recordings')
    .select('*')
    .eq('organization_id', organization_id)
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to fetch recordings: ${error.message}`)
  }
  
  return data
}

// Secure analytics operations
export async function getAnalyticsData() {
  const { supabase, organization_id } = await createSecureQuery()
  
  // Get call statistics
  const { data: calls, error: callsError } = await supabase
    .from('calls')
    .select('duration, outcome, status, timestamp')
    .eq('organization_id', organization_id)
    .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
  
  if (callsError) {
    throw new Error(`Failed to fetch analytics: ${callsError.message}`)
  }
  
  // Get lead statistics
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('status, loan_amount, created_at')
    .eq('organization_id', organization_id)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
  
  if (leadsError) {
    throw new Error(`Failed to fetch leads analytics: ${leadsError.message}`)
  }
  
  return {
    calls: calls || [],
    leads: leads || []
  }
}

// Secure billing operations
export async function getBillingInfo() {
  const { supabase, organization_id } = await createSecureQuery()
  
  const { data, error } = await supabase
    .from('billing')
    .select('*')
    .eq('organization_id', organization_id)
    .order('current_period_start', { ascending: false })
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw new Error(`Failed to fetch billing info: ${error.message}`)
  }
  
  return data
}

// Organization creation for new users
export async function createOrganization(name: string, userId: string) {
  const supabase = await getSupabase()
  
  // Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({ name, slug: name.toLowerCase().replace(/\s+/g, '-') })
    .select()
    .single()
  
  if (orgError) {
    throw new Error(`Failed to create organization: ${orgError.message}`)
  }
  
  // Update user with organization_id
  const { data: user, error: userError } = await supabase
    .from('users')
    .update({ 
      organization_id: org.id,
      business_name: name 
    })
    .eq('id', userId)
    .select()
    .single()
  
  if (userError) {
    throw new Error(`Failed to update user with organization: ${userError.message}`)
  }
  
  return { org, user }
}
