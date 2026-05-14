import { NextRequest } from 'next/server'
import {
  verifyTwilioWebhookRequest,
  logWebhookVerificationFailure,
} from '@/lib/webhook-verification'

// Twilio Webhook Handler
export async function POST(request: NextRequest) {
  const body = await request.text()

  const v = verifyTwilioWebhookRequest(request, body)
  if (!v.ok) {
    await logWebhookVerificationFailure('twilio', request, v.reason, false)
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const params = new URLSearchParams(body)

    const MessageSid = params.get('MessageSid')
    const MessageStatus = params.get('MessageStatus')

    if (process.env.NODE_ENV !== 'production') {
      console.info('Twilio webhook received:', { MessageSid, MessageStatus })
    }

    return new Response('Webhook processed', { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Twilio webhook error:', message)
    return new Response('Webhook processing failed', { status: 500 })
  }
}
