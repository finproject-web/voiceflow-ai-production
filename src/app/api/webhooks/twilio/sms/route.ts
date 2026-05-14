import { NextRequest } from 'next/server'
import {
  verifyTwilioWebhookRequest,
  logWebhookVerificationFailure,
} from '@/lib/webhook-verification'

// POST /api/webhooks/twilio/sms - Handle Twilio SMS webhooks
export async function POST(request: NextRequest) {
  const body = await request.text()

  const v = verifyTwilioWebhookRequest(request, body)
  if (!v.ok) {
    await logWebhookVerificationFailure('twilio-sms', request, v.reason, false)
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const formData = new URLSearchParams(body)
    const messageSid = formData.get('MessageSid')
    const messageStatus = formData.get('MessageStatus')

    if (process.env.NODE_ENV !== 'production') {
      console.info('Twilio SMS webhook received:', { messageSid, messageStatus })
    }

    return new Response('', { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Twilio SMS webhook error:', message)
    return new Response('Webhook processing failed', { status: 500 })
  }
}
