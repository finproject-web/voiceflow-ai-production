import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// GET /api/leads/[id] - Get lead details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the id
    const { id } = await params
    
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

    // Get lead details
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: lead 
    })
  } catch (error) {
    console.error('Error fetching lead details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lead details' },
      { status: 500 }
    )
  }
}

// PUT /api/leads/[id] - Update lead
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the id
    const { id } = await params
    
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
    const { status, notes } = body

    // Update lead
    const { data: lead, error } = await supabase
      .from('leads')
      .update({ status, notes, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error || !lead) {
      return NextResponse.json(
        { error: 'Failed to update lead' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: lead 
    })
  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    )
  }
}

// DELETE /api/leads/[id] - Delete lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the id
    const { id } = await params
    
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

    // Delete lead
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete lead' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true 
    })
  } catch (error) {
    console.error('Error deleting lead:', error)
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    )
  }
}
