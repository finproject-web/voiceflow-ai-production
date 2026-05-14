export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { warnIfProductionWebhooksMisconfigured } = await import('@/lib/env-validation')
    warnIfProductionWebhooksMisconfigured()
  }
}
