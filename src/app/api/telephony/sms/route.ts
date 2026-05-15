import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// POST /api/telephony/sms - Send SMS via telephony service
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
    const { leadId, phoneNumber, message, type } = body

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
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
    // In production, this would integrate with Twilio
    return NextResponse.json({
      success: true,
      data: {
        messageId: `telephony_msg_${Date.now()}`,
        status: 'sent',
        sentAt: new Date().toISOString(),
        cost: 0.05
      }
    })

  } catch (error) {
    console.error('Telephony SMS API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/telephony/sms - Get SMS history
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
    // In production, this would fetch from SMS logs table scoped to organization_id
    return NextResponse.json({
      success: true,
      data: {
        messages: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0
        }
      }
    })

  } catch (error) {
    console.error('Error fetching SMS history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SMS history' },
      { status: 500 }
    )
  }
}
