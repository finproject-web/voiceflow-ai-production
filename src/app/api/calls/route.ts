import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getVapiService } from '@/lib/vapi-service'

// POST /api/calls - Initiate new call
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

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

    // Parse request body
    const body = await request.json()
    const { leadId, phone, assistantId } = body

    // Validate required fields
    if (!leadId || !phone) {
      return NextResponse.json(
        { error: 'Lead ID and phone number are required' },
        { status: 400 }
      )
    }

    // Verify lead exists and belongs to organization
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('organization_id', userData.organization_id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Lead not found or access denied' },
        { status: 404 }
      )
    }

    // Create call record
    const { data: call, error: callError } = await supabase
      .from('calls')
      .insert({
        organization_id: userData.organization_id,
        lead_id: leadId,
        phone: phone,
        status: 'scheduled',
        ai_assistant_id: assistantId || process.env.VAPI_DEFAULT_ASSISTANT_ID,
        timestamp: new Date().toISOString()
      })
      .select()
      .single()

    if (callError) throw callError

    // Initiate actual AI call using Vapi
    try {
      const vapiService = getVapiService()
      const vapiCall = await vapiService.createCall(phone, assistantId)
      
      // Update call record with Vapi call ID
      await supabase
        .from('calls')
        .update({
          call_sid: vapiCall.id,
          status: 'in_progress'
        })
        .eq('id', call.id)

      return NextResponse.json({ 
        success: true, 
        data: {
          callId: call.id,
          leadId: lead.id,
          status: 'in_progress',
          phone: phone,
          vapiCallId: vapiCall.id
        }
      }, { status: 201 })
    } catch (vapiError) {
      console.error('Vapi call failed:', vapiError)
      
      // Update call record to failed status
      await supabase
        .from('calls')
        .update({
          status: 'failed',
          outcome: 'not_connected'
        })
        .eq('id', call.id)

      return NextResponse.json({ 
        success: false, 
        error: 'Failed to initiate AI call',
        data: {
          callId: call.id,
          leadId: lead.id,
          status: 'failed'
        }
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error initiating call:', error)
    return NextResponse.json(
      { error: 'Failed to initiate call' },
      { status: 500 }
    )
  }
}

// GET /api/calls - Get calls for authenticated organization
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

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

    // Parse query parameters
    const { searchParams } = new URL(request.url || '')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const status = searchParams.get('status')

    // Build query
    let query = supabase
      .from('calls')
      .select(`
        *,
        leads (
          first_name,
          last_name,
          email
        )
      `, { count: 'exact' })
      .eq('organization_id', userData.organization_id)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1).order('timestamp', { ascending: false })

    const { data: calls, error, count } = await query

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      data: { calls: calls || [], total: count || 0 },
      pagination: {
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: page * limit < (count || 0),
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching calls:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calls' },
      { status: 500 }
    )
  }
}
