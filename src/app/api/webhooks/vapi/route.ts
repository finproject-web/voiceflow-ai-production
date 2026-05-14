import { NextRequest, NextResponse } from 'next/server'
import { getVapiService } from '@/lib/vapi-service'
import {
  verifyVapiWebhookFromHeaders,
  logWebhookVerificationFailure,
} from '@/lib/webhook-verification'

// POST /api/webhooks/vapi - Handle Vapi webhooks
export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  const v = verifyVapiWebhookFromHeaders(request.headers, rawBody)
  if (!v.ok) {
    await logWebhookVerificationFailure('vapi', request, v.reason, false)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const event = JSON.parse(rawBody) as { type?: string; id?: string }

    const vapiService = getVapiService()
    const result = await vapiService.processCallWebhook(event)

    return NextResponse.json({
      success: true,
      processed: result ? true : false,
      eventType: event.type,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Error processing Vapi webhook:', message)

    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 })
  }
}

// GET /api/webhooks/vapi - Webhook verification endpoint
export async function GET() {
  try {
    return NextResponse.json({
      status: 'active',
      service: 'vapi-webhook-handler',
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 500 })
  }
}
