import { createHmac, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'
import { SecurityLogger } from './security-logging'

export type WebhookVerifyResult = {
  ok: boolean
  skippedVerification?: boolean
  reason?: string
}

function timingSafeEqualUtf8(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, 'utf8')
    const bb = Buffer.from(b, 'utf8')
    if (ba.length !== bb.length) return false
    return timingSafeEqual(ba, bb)
  } catch {
    return false
  }
}

/** Twilio must validate against the exact URL configured for the webhook (use behind proxies). */
export function getTwilioSignatureValidationUrl(request: NextRequest): string {
  const explicit = process.env.TWILIO_WEBHOOK_VALIDATION_URL?.trim()
  if (explicit) return explicit
  const proto =
    request.headers.get('x-forwarded-proto') ??
    (request.nextUrl.protocol === 'https:' ? 'https' : 'http')
  const host =
    request.headers.get('x-forwarded-host') ??
    request.headers.get('host') ??
    ''
  return `${proto}://${host}${request.nextUrl.pathname}${request.nextUrl.search}`
}

function parseFormBodyParams(rawBody: string): Record<string, string> {
  const params: Record<string, string> = {}
  new URLSearchParams(rawBody).forEach((value, key) => {
    params[key] = value
  })
  return params
}

/**
 * Validates Twilio X-Twilio-Signature using the official algorithm (HMAC-SHA1 + scmp internally).
 * Caller must pass the raw body string (same bytes Twilio signed).
 */
export function verifyTwilioSignaturePayload(
  authToken: string | undefined,
  signature: string | null | undefined,
  validationUrl: string,
  rawBody: string
): WebhookVerifyResult {
  const token = authToken?.trim()
  if (!token) {
    return { ok: true, skippedVerification: true, reason: 'twilio_auth_token_unset' }
  }
  if (!signature) {
    return { ok: false, reason: 'missing_x_twilio_signature' }
  }
  if (!validationUrl.trim()) {
    return { ok: false, reason: 'missing_twilio_validation_url' }
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { validateRequest } = require('twilio/lib/webhooks/webhooks') as {
    validateRequest: (
      authToken: string,
      twilioSignature: string,
      url: string,
      params: Record<string, string>
    ) => boolean
  }

  const params = parseFormBodyParams(rawBody)
  const ok = validateRequest(token, signature, validationUrl, params)
  return ok ? { ok: true } : { ok: false, reason: 'signature_mismatch' }
}

export function verifyTwilioWebhookRequest(
  request: NextRequest,
  rawBody: string
): WebhookVerifyResult {
  return verifyTwilioSignaturePayload(
    process.env.TWILIO_AUTH_TOKEN,
    request.headers.get('x-twilio-signature'),
    getTwilioSignatureValidationUrl(request),
    rawBody
  )
}

function verifyVapiHmacHex(rawBody: string, signatureHeader: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')
  const sig = signatureHeader.trim().toLowerCase()
  const exp = expected.toLowerCase()
  if (!/^[0-9a-f]+$/.test(sig) || sig.length !== exp.length) {
    return false
  }
  try {
    return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(exp, 'hex'))
  } catch {
    return false
  }
}

/**
 * Vapi may send either:
 * - HMAC SHA-256 hex of raw body in `x-vapi-signature` (with optional `x-vapi-timestamp` replay window)
 * - Plain shared secret in `x-vapi-secret` (legacy dashboard "secret" / X-Vapi-Secret credential)
 *
 * If `VAPI_WEBHOOK_SECRET` is unset, verification is skipped (backward compatible).
 */
export function verifyVapiWebhookFromHeaders(
  headers: Headers,
  rawBody: string
): WebhookVerifyResult {
  const secret = process.env.VAPI_WEBHOOK_SECRET?.trim()
  if (!secret) {
    return { ok: true, skippedVerification: true, reason: 'vapi_webhook_secret_unset' }
  }

  const xVapiSecret =
    headers.get('x-vapi-secret') ??
    headers.get('X-Vapi-Secret')
  if (xVapiSecret && timingSafeEqualUtf8(xVapiSecret.trim(), secret)) {
    return { ok: true }
  }

  const signature = headers.get('x-vapi-signature') ?? headers.get('X-Vapi-Signature')
  const timestamp = headers.get('x-vapi-timestamp') ?? headers.get('X-Vapi-Timestamp')

  if (signature) {
    if (timestamp) {
      const webhookTime = parseInt(timestamp, 10)
      const now = Math.floor(Date.now() / 1000)
      if (!Number.isFinite(webhookTime) || Math.abs(now - webhookTime) > 300) {
        return { ok: false, reason: 'invalid_or_stale_timestamp' }
      }
    }
    if (verifyVapiHmacHex(rawBody, signature, secret)) {
      return { ok: true }
    }
    return { ok: false, reason: 'hmac_mismatch' }
  }

  return { ok: false, reason: 'missing_vapi_auth' }
}

export async function logWebhookVerificationFailure(
  source: string,
  request: NextRequest,
  reason: string | undefined,
  verified: boolean
): Promise<void> {
  await SecurityLogger.logWebhookReceived(
    source,
    request.url || 'unknown',
    { verified, reason },
    'unknown',
    verified
  )
}

// --- Legacy exports (kept for compatibility; prefer verifyVapiWebhookFromHeaders / verifyTwilioWebhookRequest) ---

interface WebhookVerification {
  verifySignature(payload: string, signature: string, secret: string): boolean
  verifyTimestamp(timestamp: string, maxAge?: number): boolean
  getSourceFromHeaders(headers: Headers): string
}

export class VapiWebhookVerification implements WebhookVerification {
  verifySignature(payload: string, signature: string, secret: string): boolean {
    return verifyVapiHmacHex(payload, signature, secret)
  }

  verifyTimestamp(timestamp: string, maxAge: number = 300): boolean {
    try {
      const webhookTime = parseInt(timestamp, 10)
      const now = Math.floor(Date.now() / 1000)
      return Number.isFinite(webhookTime) && Math.abs(now - webhookTime) <= maxAge
    } catch {
      return false
    }
  }

  getSourceFromHeaders(): string {
    return 'vapi'
  }
}

export class TwilioWebhookVerification implements WebhookVerification {
  verifySignature(): boolean {
    return false
  }

  verifyTimestamp(): boolean {
    return true
  }

  getSourceFromHeaders(): string {
    return 'twilio'
  }
}

export class WebhookHandler {
  /**
   * @deprecated Consumes the request body; use verifyVapiWebhookFromHeaders / verifyTwilioWebhookRequest with a single read instead.
   */
  static async verifyWebhook(
    request: NextRequest
  ): Promise<{ verified: boolean; source: string; bodyText: string }> {
    try {
      const headers = request.headers
      const bodyText = await request.text()

      const userAgent = headers.get('user-agent') || ''
      let source = 'unknown'
      if (userAgent.includes('Vapi')) {
        source = 'vapi'
      } else if (headers.get('x-twilio-signature')) {
        source = 'twilio'
      }

      if (source === 'vapi') {
        const r = verifyVapiWebhookFromHeaders(headers, bodyText)
        await SecurityLogger.logWebhookReceived(
          source,
          request.url || 'unknown',
          { verified: r.ok, reason: r.reason, content_length: bodyText.length },
          'unknown',
          r.ok
        )
        return { verified: r.ok, source, bodyText }
      }

      if (source === 'twilio') {
        const r = verifyTwilioWebhookRequest(request, bodyText)
        await SecurityLogger.logWebhookReceived(
          source,
          request.url || 'unknown',
          { verified: r.ok, reason: r.reason, content_length: bodyText.length },
          'unknown',
          r.ok
        )
        return { verified: r.ok, source, bodyText }
      }

      await SecurityLogger.logWebhookReceived(
        'unknown',
        request.url || 'unknown',
        { error: 'unknown_webhook_source', content_length: bodyText.length },
        'unknown',
        false
      )
      return { verified: false, source, bodyText }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('Webhook verification error:', message)
      await SecurityLogger.logWebhookReceived(
        'unknown',
        request.url || 'unknown',
        { error: message },
        'unknown',
        false
      )
      return { verified: false, source: 'unknown', bodyText: '' }
    }
  }

  static async processWebhook(
    request: NextRequest,
    handler: (data: unknown, source: string) => Promise<void>
  ): Promise<Response> {
    const { verified, source, bodyText } = await this.verifyWebhook(request)

    if (!verified) {
      return new Response('Unauthorized webhook', {
        status: 401,
        headers: { 'Content-Type': 'text/plain' },
      })
    }

    try {
      const data = JSON.parse(bodyText) as unknown
      await handler(data, source)

      return new Response('Webhook processed successfully', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('Webhook processing error:', message)
      await SecurityLogger.logSecurityViolation(
        'webhook_processing_error',
        { error: message, source },
        'unknown',
        'high'
      )

      return new Response('Internal server error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      })
    }
  }
}
