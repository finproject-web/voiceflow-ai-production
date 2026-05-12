import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userData?.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const organizationId = userData.organization_id

    // Get current date ranges
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

    // Fetch real data from database
    const [
      leadsResult,
      callsResult,
      todayLeadsResult,
      todayCallsResult,
      activeCallsResult
    ] = await Promise.all([
      // Total leads
      supabase
        .from('leads')
        .select('id')
        .eq('organization_id', organizationId),
      
      // Total calls
      supabase
        .from('calls')
        .select('id, duration, outcome, timestamp')
        .eq('organization_id', organizationId),
      
      // Today's leads
      supabase
        .from('leads')
        .select('id')
        .eq('organization_id', organizationId)
        .gte('created_at', todayStart.toISOString()),
      
      // Today's calls
      supabase
        .from('calls')
        .select('id, duration, outcome, timestamp')
        .eq('organization_id', organizationId)
        .gte('timestamp', todayStart.toISOString()),
      
      // Active calls (last 5 minutes)
      supabase
        .from('calls')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('status', 'in_progress')
        .gte('timestamp', fiveMinutesAgo.toISOString())
    ])

    // Calculate statistics
    const totalLeads = leadsResult.data?.length || 0
    const totalCalls = callsResult.data?.length || 0
    const newLeadsToday = todayLeadsResult.data?.length || 0
    const completedCalls = callsResult.data?.filter(call => call.outcome === 'connected') || []
    const todayCompletedCalls = todayCallsResult.data?.filter(call => call.outcome === 'connected') || []
    const missedCalls = callsResult.data?.filter(call => call.outcome === 'not_connected') || []
    const activeCalls = activeCallsResult.data?.length || 0

    // Calculate average call duration
    const avgCallDuration = completedCalls.length > 0
      ? Math.floor(completedCalls.reduce((sum, call) => sum + (call.duration || 0), 0) / completedCalls.length)
      : 0

    // Calculate conversion rate
    const conversionRate = totalLeads > 0
      ? ((completedCalls.length / totalLeads) * 100)
      : 0

    // Calculate revenue (average commission per completed call)
    const revenue = todayCompletedCalls.length * 250

    const stats = {
      totalLeads,
      activeCalls,
      completedCalls: completedCalls.length,
      conversionRate,
      revenue,
      missedCalls: missedCalls.length,
      avgCallDuration,
      newLeadsToday
    }

    return NextResponse.json({ 
      success: true, 
      data: stats 
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}
