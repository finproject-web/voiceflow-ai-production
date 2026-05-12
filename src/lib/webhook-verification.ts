import { SecurityLogger } from './security-logging'
import { NextRequest } from 'next/server'

interface WebhookVerification {
  verifySignature(payload: string, signature: string, secret: string): boolean
  verifyTimestamp(timestamp: string, maxAge?: number): boolean
  getSourceFromHeaders(headers: Headers): string
}

// Vapi Webhook Verification
class VapiWebhookVerification implements WebhookVerification {
  verifySignature(payload: string, signature: string, secret: string): boolean {
    try {
      const crypto = require('crypto')
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')
      
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    } catch (error) {
      console.error('Vapi signature verification error:', error)
      return false
    }
  }

  verifyTimestamp(timestamp: string, maxAge: number = 300): boolean {
    try {
      const webhookTime = parseInt(timestamp)
      const now = Math.floor(Date.now() / 1000)
      return (now - webhookTime) <= maxAge
    } catch (error) {
      console.error('Vapi timestamp verification error:', error)
      return false
    }
  }

  getSourceFromHeaders(headers: Headers): string {
    return 'vapi'
  }
}

// Twilio Webhook Verification
class TwilioWebhookVerification implements WebhookVerification {
  verifySignature(payload: string, signature: string, secret: string): boolean {
    try {
      const crypto = require('crypto')
      const expectedSignature = crypto
        .createHmac('sha1', secret)
        .update(payload)
        .digest('base64')
      
      return signature === expectedSignature
    } catch (error) {
      console.error('Twilio signature verification error:', error)
      return false
    }
  }

  verifyTimestamp(timestamp: string, maxAge: number = 300): boolean {
    try {
      const webhookTime = new Date(timestamp).getTime()
      const now = Date.now()
      return (now - webhookTime) <= (maxAge * 1000)
    } catch (error) {
      console.error('Twilio timestamp verification error:', error)
      return false
    }
  }

  getSourceFromHeaders(headers: Headers): string {
    return 'twilio'
  }
}

// Generic Webhook Handler
export class WebhookHandler {
  private static getVerificationService(source: string): WebhookVerification {
    switch (source) {
      case 'vapi':
        return new VapiWebhookVerification()
      case 'twilio':
        return new TwilioWebhookVerification()
      default:
        throw new Error(`Unknown webhook source: ${source}`)
    }
  }

  static async verifyWebhook(request: NextRequest): Promise<{ verified: boolean; source: string }> {
    try {
      const headers = request.headers
      const body = await request.text()
      
      // Detect source from headers
      const userAgent = headers.get('user-agent') || ''
      let source = 'unknown'
      
      if (userAgent.includes('Vapi')) {
        source = 'vapi'
      } else if (headers.get('x-twilio-signature')) {
        source = 'twilio'
      }

      const verificationService = this.getVerificationService(source)
      
      // Get verification data
      let signature: string | null = null
      let timestamp: string | null = null
      let secret: string | null = null

      switch (source) {
        case 'vapi':
          signature = headers.get('x-vapi-signature')
          timestamp = headers.get('x-vapi-timestamp')
          secret = process.env.VAPI_WEBHOOK_SECRET!
          break
        case 'twilio':
          signature = headers.get('x-twilio-signature')
          timestamp = headers.get('x-twilio-request-timestamp')
          secret = process.env.TWILIO_AUTH_TOKEN!
          break
      }

      if (!signature || !timestamp || !secret) {
        await SecurityLogger.logWebhookReceived(
          source,
          request.url || 'unknown',
          { error: 'Missing verification headers' },
          request.ip || 'unknown',
          false
        )
        return { verified: false, source }
      }

      // Verify timestamp
      const timestampValid = verificationService.verifyTimestamp(timestamp)
      if (!timestampValid) {
        await SecurityLogger.logWebhookReceived(
          source,
          request.url || 'unknown',
          { error: 'Invalid timestamp' },
          request.ip || 'unknown',
          false
        )
        return { verified: false, source }
      }

      // Verify signature
      const signatureValid = verificationService.verifySignature(body, signature, secret)
      
      await SecurityLogger.logWebhookReceived(
        source,
        request.url || 'unknown',
        { body_preview: body.substring(0, 100) },
        request.ip || 'unknown',
        signatureValid
      )

      return { verified: signatureValid, source }
    } catch (error) {
      console.error('Webhook verification error:', error)
      await SecurityLogger.logWebhookReceived(
        'unknown',
        request.url || 'unknown',
        { error: error.message },
        request.ip || 'unknown',
        false
      )
      return { verified: false, source: 'unknown' }
    }
  }

  static async processWebhook(
    request: NextRequest,
    handler: (data: any, source: string) => Promise<void>
  ): Promise<Response> {
    const { verified, source } = await this.verifyWebhook(request)

    if (!verified) {
      return new Response('Unauthorized webhook', { 
        status: 401,
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    try {
      const body = await request.json()
      await handler(body, source)
      
      return new Response('Webhook processed successfully', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
    } catch (error) {
      console.error('Webhook processing error:', error)
      await SecurityLogger.logSecurityViolation(
        'webhook_processing_error',
        { error: error.message, source },
        request.ip || 'unknown',
        'high'
      )
      
      return new Response('Internal server error', { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      })
    }
  }
}

export { VapiWebhookVerification, TwilioWebhookVerification }
