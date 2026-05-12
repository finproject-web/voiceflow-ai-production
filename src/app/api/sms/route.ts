import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// POST /api/sms - Send SMS message
export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { phone, message, leadId } = body

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone and message are required' },
        { status: 400 }
      )
    }

    // For now, just return a success response
    // In production, this would integrate with Twilio
    return NextResponse.json({
      success: true,
      data: {
        messageId: `msg_${Date.now()}`,
        to: phone,
        messagePreview: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        sentAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('SMS API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/sms - Get SMS history for organization
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // For now, return empty history
    // In production, this would fetch from SMS logs table
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
