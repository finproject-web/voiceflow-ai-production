import { NextRequest, NextResponse } from 'next/server'
import { getBillingInfo, getAuthenticatedUser } from '@/lib/server-actions'

// GET /api/billing - Fetch billing info for authenticated organization
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

    // Get billing info with automatic organization scoping
    const billingInfo = await getBillingInfo()
    
    return NextResponse.json({ 
      success: true, 
      data: billingInfo 
    })
  } catch (error) {
    console.error('Error fetching billing info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing info' },
      { status: 500 }
    )
  }
}
