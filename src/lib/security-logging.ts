import { createServerClient } from '@supabase/supabase-js'
import { Database } from './supabase'

interface SecurityLogEntry {
  event_type: 'auth_attempt' | 'api_access' | 'webhook_received' | 'rate_limit' | 'security_violation'
  user_id?: string
  organization_id?: string
  ip_address?: string
  user_agent?: string
  endpoint?: string
  details?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
}

interface RateLimitEntry {
  key: string
  count: number
  reset_time: number
}

class SecurityLogger {
  private static supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  private static rateLimitStore = new Map<string, RateLimitEntry>()

  static async log(entry: Omit<SecurityLogEntry, 'timestamp'>) {
    try {
      const logEntry: SecurityLogEntry = {
        ...entry,
        timestamp: new Date().toISOString()
      }

      // Store in database for long-term storage
      const { error } = await this.supabase
        .from('security_logs')
        .insert(logEntry)

      if (error) {
        console.error('Failed to log security event:', error)
        // Fallback to console logging
        console.error('Security Log:', logEntry)
      }

      // Also log to console for immediate visibility
      console.log(`[SECURITY] ${entry.event_type}:`, {
        severity: entry.severity,
        user_id: entry.user_id,
        organization_id: entry.organization_id,
        ip_address: entry.ip_address,
        endpoint: entry.endpoint
      })
    } catch (error) {
      console.error('Security logging error:', error)
    }
  }

  static async logAuthAttempt(
    userId: string | undefined,
    organizationId: string | undefined,
    success: boolean,
    ipAddress: string,
    userAgent: string
  ) {
    await this.log({
      event_type: 'auth_attempt',
      user_id: userId,
      organization_id: organizationId,
      ip_address: ipAddress,
      user_agent: userAgent,
      details: { success },
      severity: success ? 'low' : 'medium'
    })
  }

  static async logAPIAccess(
    userId: string,
    organizationId: string,
    endpoint: string,
    method: string,
    ipAddress: string,
    userAgent: string
  ) {
    await this.log({
      event_type: 'api_access',
      user_id: userId,
      organization_id: organizationId,
      endpoint,
      ip_address: ipAddress,
      user_agent: userAgent,
      details: { method },
      severity: 'low'
    })
  }

  static async logWebhookReceived(
    source: string,
    endpoint: string,
    payload: any,
    ipAddress: string,
    verified: boolean
  ) {
    await this.log({
      event_type: 'webhook_received',
      endpoint,
      ip_address: ipAddress,
      details: { 
        source, 
        payload_size: JSON.stringify(payload).length,
        verified 
      },
      severity: verified ? 'low' : 'high'
    })
  }

  static async logRateLimit(
    key: string,
    limit: number,
    window: number,
    ipAddress: string,
    endpoint?: string
  ) {
    await this.log({
      event_type: 'rate_limit',
      ip_address: ipAddress,
      endpoint,
      details: { key, limit, window },
      severity: 'medium'
    })
  }

  static async logSecurityViolation(
    type: string,
    details: Record<string, any>,
    ipAddress: string,
    severity: 'high' | 'critical' = 'high'
  ) {
    await this.log({
      event_type: 'security_violation',
      ip_address: ipAddress,
      details: { violation_type: type, ...details },
      severity
    })
  }

  // Rate limiting
  static checkRateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now()
    const existing = this.rateLimitStore.get(key)

    if (!existing || now > existing.reset_time) {
      // New window or expired window
      this.rateLimitStore.set(key, {
        key,
        count: 1,
        reset_time: now + windowMs
      })
      return true
    }

    if (existing.count >= limit) {
      return false
    }

    // Increment count
    this.rateLimitStore.set(key, {
      ...existing,
      count: existing.count + 1
    })

    return true
  }

  // Clean up expired rate limit entries
  static cleanupRateLimits() {
    const now = Date.now()
    for (const [key, entry] of this.rateLimitStore.entries()) {
      if (now > entry.reset_time) {
        this.rateLimitStore.delete(key)
      }
    }
  }
}

// Auto-cleanup rate limits every 5 minutes
setInterval(() => {
  SecurityLogger.cleanupRateLimits()
}, 5 * 60 * 1000)

export { SecurityLogger, type SecurityLogEntry }
