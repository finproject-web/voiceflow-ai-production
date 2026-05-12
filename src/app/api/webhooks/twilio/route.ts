import { NextRequest } from 'next/server'

// Twilio Webhook Handler
export async function POST(request: NextRequest) {
  try {
    // Get webhook data
    const body = await request.text()
    const params = new URLSearchParams(body)
    
    // Extract Twilio webhook data
    const MessageSid = params.get('MessageSid')
    const MessageStatus = params.get('MessageStatus')
    const From = params.get('From')
    const To = params.get('To')
    const Body = params.get('Body')

    console.log('Twilio webhook received:', {
      MessageSid,
      MessageStatus,
      From,
      To,
      Body
    })

    // For now, just acknowledge the webhook
    // In production, this would update the database with SMS status
    return new Response('Webhook processed', { status: 200 })

  } catch (error) {
    console.error('Twilio webhook error:', error)
    return new Response('Webhook processing failed', { status: 500 })
  }
}
