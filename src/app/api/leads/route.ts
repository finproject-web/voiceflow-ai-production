import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET /api/leads - Get leads with filtering and pagination
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
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')

    // Build query
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('organization_id', userData.organization_id)

    // Apply filters
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    }
    if (status) {
      query = query.eq('status', status)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false })

    const { data: leads, error, count } = await query

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      data: { leads: leads || [], total: count || 0 },
      pagination: {
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: page * limit < (count || 0),
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

// POST /api/leads - Create new lead
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
    const { 
      first_name, 
      last_name, 
      email, 
      phone, 
      loan_amount, 
      property_address, 
      property_value, 
      credit_score, 
      income, 
      notes 
    } = body

    // Validate required fields
    if (!first_name || !last_name || !phone) {
      return NextResponse.json(
        { error: 'First name, last name, and phone are required' },
        { status: 400 }
      )
    }

    // Create lead
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        organization_id: userData.organization_id,
        first_name,
        last_name,
        email: email || null,
        phone,
        loan_amount: loan_amount || null,
        property_address: property_address || null,
        property_value: property_value || null,
        credit_score: credit_score || null,
        income: income || null,
        notes: notes || null
      })
      .select()
      .single()

    if (error) throw error
    
    return NextResponse.json({ 
      success: true, 
      data: lead 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}
