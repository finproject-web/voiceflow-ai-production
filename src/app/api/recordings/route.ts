import { NextRequest, NextResponse } from 'next/server'
import { getRecordings, getAuthenticatedUser } from '@/lib/server-actions'

// GET /api/recordings - Fetch all recordings for authenticated organization
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

    // Get recordings with automatic organization scoping
    const recordings = await getRecordings()
    
    return NextResponse.json({ 
      success: true, 
      data: recordings,
      count: recordings.length 
    })
  } catch (error) {
    console.error('Error fetching recordings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recordings' },
      { status: 500 }
    )
  }
}
