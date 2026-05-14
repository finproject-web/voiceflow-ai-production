/**
 * Non-throwing startup checks for production webhook posture.
 * Call from instrumentation so missing secrets are visible in server logs.
 */
export function warnIfProductionWebhooksMisconfigured(): void {
  if (process.env.NODE_ENV !== 'production') return

  const missing: string[] = []
  if (!process.env.VAPI_WEBHOOK_SECRET?.trim()) {
    missing.push('VAPI_WEBHOOK_SECRET (Vapi webhooks accepted without crypto verification)')
  }
  if (!process.env.TWILIO_AUTH_TOKEN?.trim()) {
    missing.push('TWILIO_AUTH_TOKEN (Twilio webhooks accepted without signature verification)')
  }
  if (!process.env.TWILIO_WEBHOOK_VALIDATION_URL?.trim()) {
    missing.push(
      'TWILIO_WEBHOOK_VALIDATION_URL (Twilio signature validation uses Host/Forwarded headers; set explicit URL if behind proxies)'
    )
  }

  if (missing.length === 0) return

  console.warn(
    `[env] Production webhook configuration: ${missing.join('; ')}`
  )
}
