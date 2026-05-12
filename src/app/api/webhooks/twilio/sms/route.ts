import { NextRequest, NextResponse } from 'next/server'

// POST /api/webhooks/twilio/sms - Handle Twilio SMS webhooks
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.text()
    
    // Parse form data
    const formData = new URLSearchParams(body)
    const messageSid = formData.get('MessageSid')
    const messageStatus = formData.get('MessageStatus')
    const from = formData.get('From')
    const to = formData.get('To')
    const messageBody = formData.get('Body')

    console.log('Twilio SMS webhook received:', {
      messageSid,
      messageStatus,
      from,
      to,
      messageBody
    })

    // For now, just acknowledge the webhook
    // In production, this would update the database with SMS status
    return new Response('', { status: 200 })

  } catch (error) {
    console.error('Twilio SMS webhook error:', error)
    return new Response('Webhook processing failed', { status: 500 })
  }
}
