import { NextRequest, NextResponse } from 'next/server'
import { getAnalyticsData, getAuthenticatedUser } from '@/lib/server-actions'

// GET /api/analytics - Fetch analytics data for authenticated organization
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await getAuthenticatedUser()
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get analytics data with automatic organization scoping
    const analyticsData = await getAnalyticsData()
    
    // Process analytics
    const totalCalls = analyticsData.calls.length
    const connectedCalls = analyticsData.calls.filter(call => 'outcome' in call && call.outcome === 'connected').length
    const conversionRate = totalCalls > 0 ? (connectedCalls / totalCalls) * 100 : 0
    
    const totalLeads = analyticsData.leads.length
    const convertedLeads = analyticsData.leads.filter(lead => 'status' in lead && lead.status === 'converted').length
    const leadConversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

    // Prepare chart data
    const callsByDay = analyticsData.calls.reduce((acc, call) => {
      if ('timestamp' in call) {
        const date = new Date(call.timestamp).toLocaleDateString()
        acc[date] = (acc[date] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const conversionByDay = analyticsData.calls.reduce((acc, call) => {
      if ('timestamp' in call && 'outcome' in call) {
        const date = new Date(call.timestamp).toLocaleDateString()
        if (call.outcome === 'connected') {
          acc[date] = (acc[date] || 0) + 1
        }
      }
      return acc
    }, {} as Record<string, number>)

    const outcomes = analyticsData.calls.reduce((acc, call) => {
      if ('outcome' in call) {
        acc[call.outcome] = (acc[call.outcome] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({ 
      success: true, 
      data: {
        summary: {
          totalCalls,
          connectedCalls,
          conversionRate: Math.round(conversionRate * 10) / 10,
          totalLeads,
          convertedLeads,
          leadConversionRate: Math.round(leadConversionRate * 10) / 10
        },
        charts: {
          callsByDay: Object.entries(callsByDay).map(([date, count]) => ({ date, count })),
          conversionByDay: Object.entries(conversionByDay).map(([date, count]) => ({ date, count })),
          outcomes: Object.entries(outcomes).map(([outcome, count]) => ({ outcome, count }))
        }
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
