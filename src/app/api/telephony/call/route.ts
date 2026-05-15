import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// POST /api/telephony/call - Initiate phone call
export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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

    // Parse request body
    const body = await request.json()
    const { leadId, phoneNumber, type, priority, notes } = body

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // If leadId is provided, verify lead belongs to user's organization
    if (leadId) {
      const { data: lead } = await supabase
        .from('leads')
        .select('id')
        .eq('id', leadId)
        .eq('organization_id', userData.organization_id)
        .single()

      if (!lead) {
        return NextResponse.json(
          { error: 'Lead not found or access denied' },
          { status: 403 }
        )
      }
    }

    // For now, just return a success response
    // In production, this would integrate with Twilio/Vapi
    return NextResponse.json({
      success: true,
      data: {
        callId: `call_${Date.now()}`,
        status: 'initiated',
        initiatedAt: new Date().toISOString(),
        estimatedDuration: 300,
        cost: 0.10
      }
    })

  } catch (error) {
    console.error('Telephony call API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/telephony/call - Get call history
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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

    // For now, return empty history
    // In production, this would fetch from calls table scoped to organization_id
    return NextResponse.json({
      success: true,
      data: {
        calls: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0
        }
      }
    })

  } catch (error) {
    console.error('Error fetching call history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch call history' },
      { status: 500 }
    )
  }
}
