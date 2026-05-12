import { NextRequest, NextResponse } from 'next/server'
import { getVapiService } from '@/lib/vapi-service'

// POST /api/webhooks/vapi - Handle Vapi webhooks
export async function POST(request: NextRequest) {
  try {
    // Get raw body for parsing
    const body = await request.text()
    
    // Parse webhook payload
    const event = JSON.parse(body)
    
    console.log('Vapi webhook received:', event.type, event.id)
    
    // Process webhook event using Vapi service
    const vapiService = getVapiService()
    const result = await vapiService.processCallWebhook(event)
    
    return NextResponse.json({ 
      success: true,
      processed: result ? true : false,
      eventType: event.type
    })
  } catch (error) {
    console.error('Error processing Vapi webhook:', error)
    
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

// GET /api/webhooks/vapi - Webhook verification endpoint
export async function GET(request: NextRequest) {
  try {
    // Return webhook verification response
    return NextResponse.json({ 
      status: 'active',
      service: 'vapi-webhook-handler',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 500 }
    )
  }
}
