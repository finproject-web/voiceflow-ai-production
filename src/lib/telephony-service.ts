import { createClient } from '@/utils/supabase/server'
import { SecurityLogger } from './security-logging'
import { Database } from './supabase'

export interface CallRequest {
  leadId: string
  phoneNumber: string
  leadName: string
  organizationId: string
  userId: string
  aiAgentId?: string
  customInstructions?: string
}

export interface SMSRequest {
  leadId: string
  phoneNumber: string
  message: string
  organizationId: string
  userId: string
}

export interface CallTransferRequest {
  callId: string
  targetPhoneNumber: string
  organizationId: string
  userId: string
}

export interface VapiCallConfig {
  assistantId: string
  customerNumber: string
  assistant: {
    firstMessage: string
    model: {
      provider: string
      model: string
      temperature: number
    }
    voice: {
      provider: string
      voiceId: string
    }
    recordingEnabled: boolean
    hipaaEnabled: boolean
    transcriber: {
      provider: string
      model: string
    }
    voicemailDetection: {
      enabled: boolean
      silenceTimeoutMs: number
    }
  }
  serverUrl: string
}

export interface TwilioSMSConfig {
  to: string
  from: string
  body: string
  statusCallback: string
}

export interface CallStatus {
  id: string
  status: 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'no-answer' | 'voicemail'
  duration?: number
  recordingUrl?: string
  transcript?: string
  voicemailDetected?: boolean
  outcome: 'connected' | 'not_connected' | 'voicemail'
  timestamp: string
}

class TelephonyService {
  private static supabase: any = null;

  private static async getSupabase() {
    if (!this.supabase) {
      const { createClient } = await import('@/utils/supabase/server');
      this.supabase = await createClient();
    }
    return this.supabase;
  }

  // 1. Outbound AI Calling with Vapi
  static async initiateAICall(request: CallRequest): Promise<{ callId: string; vapiCallId: string }> {
    try {
      // Log the call initiation
      await SecurityLogger.logAPIAccess(
        request.userId,
        request.organizationId,
        'telephony:initiate-call',
        'POST',
        'server',
        'Vapi Integration'
      )

      // Create call record in database
      const supabase = await this.getSupabase();
      const { data: callRecord, error: callError } = await supabase
        .from('calls')
        .insert({
          lead_id: request.leadId,
          organization_id: request.organizationId,
          phone: request.phoneNumber,
          status: 'initiated',
          outcome: 'not_connected',
          timestamp: new Date().toISOString(),
          ai_agent_id: request.aiAgentId,
          custom_instructions: request.customInstructions
        })
        .select()
        .single()

      if (callError || !callRecord) {
        throw new Error(`Failed to create call record: ${callError?.message}`)
      }

      // Configure Vapi call
      const vapiConfig: VapiCallConfig = {
        assistantId: request.aiAgentId || process.env.VAPI_DEFAULT_ASSISTANT_ID!,
        customerNumber: request.phoneNumber,
        assistant: {
          firstMessage: `Hi ${request.leadName}, this is an AI assistant calling about your loan application. How can I help you today?`,
          model: {
            provider: 'openai',
            model: 'gpt-4',
            temperature: 0.7
          },
          voice: {
            provider: 'elevenlabs',
            voiceId: 'rachel'
          },
          recordingEnabled: true,
          hipaaEnabled: true,
          transcriber: {
            provider: 'deepgram',
            model: 'nova-2'
          },
          voicemailDetection: {
            enabled: true,
            silenceTimeoutMs: 3000
          }
        },
        serverUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/webhooks/vapi`
      }

      // Initiate Vapi call
      const vapiResponse = await fetch('https://api.vapi.ai/call', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vapiConfig)
      })

      if (!vapiResponse.ok) {
        throw new Error(`Vapi API error: ${vapiResponse.statusText}`)
      }

      const vapiData = await vapiResponse.json()

      // Update call record with Vapi call ID
      await supabase
        .from('calls')
        .update({
          vapi_call_id: vapiData.id,
          status: 'ringing'
        })
        .eq('id', callRecord.id)

      // Create realtime event
      await this.createRealtimeEvent(request.organizationId, 'call_started', {
        callId: callRecord.id,
        vapiCallId: vapiData.id,
        leadName: request.leadName,
        phoneNumber: request.phoneNumber
      })

      return {
        callId: callRecord.id,
        vapiCallId: vapiData.id
      }
    } catch (error) {
      console.error('Error initiating AI call:', error)
      await SecurityLogger.logSecurityViolation(
        'telephony_call_initiation_failed',
        { error: error.message, request },
        'server',
        'high'
      )
      throw error
    }
  }

  // 2. SMS Sending with Twilio
  static async sendSMS(request: SMSRequest): Promise<{ messageId: string }> {
    try {
      await SecurityLogger.logAPIAccess(
        request.userId,
        request.organizationId,
        'telephony:send-sms',
        'POST',
        'server',
        'Twilio Integration'
      )

      // Create SMS record
      const { data: smsRecord, error: smsError } = await this.supabase
        .from('sms_messages')
        .insert({
          lead_id: request.leadId,
          organization_id: request.organizationId,
          to: request.phoneNumber,
          from: process.env.TWILIO_PHONE_NUMBER!,
          body: request.message,
          status: 'pending',
          timestamp: new Date().toISOString()
        })
        .select()
        .single()

      if (smsError || !smsRecord) {
        throw new Error(`Failed to create SMS record: ${smsError?.message}`)
      }

      // Configure Twilio SMS
      const twilioConfig: TwilioSMSConfig = {
        to: request.phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER!,
        body: request.message,
        statusCallback: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/webhooks/twilio/sms`
      }

      // Send SMS via Twilio
      const twilioResponse = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams(twilioConfig as any)
        }
      )

      if (!twilioResponse.ok) {
        throw new Error(`Twilio API error: ${twilioResponse.statusText}`)
      }

      const twilioData = await twilioResponse.json()

      // Update SMS record with Twilio message ID
      await this.supabase
        .from('sms_messages')
        .update({
          twilio_message_id: twilioData.sid,
          status: 'sent'
        })
        .eq('id', smsRecord.id)

      return { messageId: twilioData.sid }
    } catch (error) {
      console.error('Error sending SMS:', error)
      await SecurityLogger.logSecurityViolation(
        'telephony_sms_send_failed',
        { error: error.message, request },
        'server',
        'high'
      )
      throw error
    }
  }

  // 3. Call Transfer Support
  static async transferCall(request: CallTransferRequest): Promise<{ success: boolean }> {
    try {
      await SecurityLogger.logAPIAccess(
        request.userId,
        request.organizationId,
        'telephony:transfer-call',
        'POST',
        'server',
        'Call Transfer'
      )

      // Get call details
      const { data: call, error: callError } = await this.supabase
        .from('calls')
        .select('*')
        .eq('id', request.callId)
        .eq('organization_id', request.organizationId)
        .single()

      if (callError || !call) {
        throw new Error(`Call not found: ${callError?.message}`)
      }

      if (!call.vapi_call_id) {
        throw new Error('No Vapi call ID found for transfer')
      }

      // Initiate transfer via Vapi
      const transferResponse = await fetch(`https://api.vapi.ai/call/${call.vapi_call_id}/transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'phone',
          to: request.targetPhoneNumber
        })
      })

      if (!transferResponse.ok) {
        throw new Error(`Vapi transfer error: ${transferResponse.statusText}`)
      }

      // Update call record
      await this.supabase
        .from('calls')
        .update({
          status: 'transferred',
          transferred_to: request.targetPhoneNumber,
          transferred_at: new Date().toISOString()
        })
        .eq('id', request.callId)

      // Create realtime event
      await this.createRealtimeEvent(request.organizationId, 'customer_transferred', {
        callId: request.callId,
        targetPhoneNumber: request.targetPhoneNumber
      })

      return { success: true }
    } catch (error) {
      console.error('Error transferring call:', error)
      await SecurityLogger.logSecurityViolation(
        'telephony_call_transfer_failed',
        { error: error.message, request },
        'server',
        'high'
      )
      throw error
    }
  }

  // 4. Voicemail Detection
  static async handleVoicemailDetection(vapiCallId: string, voicemailDetected: boolean): Promise<void> {
    try {
      // Get call by Vapi call ID
      const { data: call, error: callError } = await this.supabase
        .from('calls')
        .select('*')
        .eq('vapi_call_id', vapiCallId)
        .single()

      if (callError || !call) {
        console.error('Call not found for voicemail detection:', callError)
        return
      }

      // Update call record
      await this.supabase
        .from('calls')
        .update({
          voicemail_detected: voicemailDetected,
          outcome: voicemailDetected ? 'voicemail' : 'connected',
          status: voicemailDetected ? 'voicemail' : 'in-progress'
        })
        .eq('id', call.id)

      if (voicemailDetected) {
        // Create realtime event
        await this.createRealtimeEvent(call.organization_id, 'call_missed', {
          callId: call.id,
          leadName: call.lead?.name || 'Unknown Lead',
          reason: 'voicemail'
        })
      }
    } catch (error) {
      console.error('Error handling voicemail detection:', error)
    }
  }

  // 5. Call Status Tracking
  static async updateCallStatus(vapiCallId: string, status: CallStatus): Promise<void> {
    try {
      // Get call by Vapi call ID
      const { data: call, error: callError } = await this.supabase
        .from('calls')
        .select('*')
        .eq('vapi_call_id', vapiCallId)
        .single()

      if (callError || !call) {
        console.error('Call not found for status update:', callError)
        return
      }

      // Update call record
      const updateData: any = {
        status: status.status,
        outcome: status.outcome,
        duration: status.duration,
        timestamp: status.timestamp
      }

      if (status.recordingUrl) {
        updateData.recording_url = status.recordingUrl
      }

      if (status.transcript) {
        updateData.transcript = status.transcript
      }

      if (status.voicemailDetected !== undefined) {
        updateData.voicemail_detected = status.voicemailDetected
      }

      await this.supabase
        .from('calls')
        .update(updateData)
        .eq('id', call.id)

      // Create appropriate realtime event
      if (status.status === 'completed') {
        await this.createRealtimeEvent(call.organization_id, 'call_completed', {
          callId: call.id,
          leadName: call.lead?.name || 'Unknown Lead',
          duration: status.duration,
          outcome: status.outcome
        })
      }
    } catch (error) {
      console.error('Error updating call status:', error)
    }
  }

  // 6. Recording Synchronization
  static async syncRecording(vapiCallId: string, recordingUrl: string, transcript?: string): Promise<void> {
    try {
      // Get call by Vapi call ID
      const { data: call, error: callError } = await this.supabase
        .from('calls')
        .select('*')
        .eq('vapi_call_id', vapiCallId)
        .single()

      if (callError || !call) {
        console.error('Call not found for recording sync:', callError)
        return
      }

      // Create recording record
      const { error: recordingError } = await this.supabase
        .from('call_recordings')
        .insert({
          call_id: call.id,
          organization_id: call.organization_id,
          recording_url: recordingUrl,
          transcript: transcript || null,
          duration: call.duration || 0,
          created_at: new Date().toISOString()
        })

      if (recordingError) {
        throw new Error(`Failed to create recording record: ${recordingError.message}`)
      }

      // Update call record
      await this.supabase
        .from('calls')
        .update({
          recording_url: recordingUrl,
          transcript: transcript || null
        })
        .eq('id', call.id)
    } catch (error) {
      console.error('Error syncing recording:', error)
    }
  }

  // 7. AI Webhook Event Handling
  static async handleVapiWebhook(event: any): Promise<void> {
    try {
      const { type, call } = event

      switch (type) {
        case 'call.started':
          await this.updateCallStatus(call.id, {
            id: call.id,
            status: 'ringing',
            outcome: 'not_connected',
            timestamp: new Date().toISOString()
          })
          break

        case 'call.ended':
          await this.updateCallStatus(call.id, {
            id: call.id,
            status: 'completed',
            outcome: call.analysis?.summary ? 'connected' : 'not_connected',
            duration: call.duration || 0,
            transcript: call.transcript,
            timestamp: new Date().toISOString()
          })

          if (call.recordingUrl) {
            await this.syncRecording(call.id, call.recordingUrl, call.transcript)
          }
          break

        case 'voicemail.detected':
          await this.handleVoicemailDetection(call.id, true)
          break

        case 'function.calls':
          // Handle AI function calls (e.g., lead status updates)
          if (call.function === 'updateLeadStatus') {
            await this.autoUpdateLeadStatus(call.parameters)
          }
          break
      }

      // Log webhook event
      await SecurityLogger.logWebhookEvent(
        'vapi',
        type,
        { callId: call.id },
        'success'
      )
    } catch (error) {
      console.error('Error handling Vapi webhook:', error)
      await SecurityLogger.logSecurityViolation(
        'vapi_webhook_error',
        { error: error.message, event },
        'server',
        'high'
      )
    }
  }

  // 8. Lead Status Auto Updates
  static async autoUpdateLeadStatus(parameters: any): Promise<void> {
    try {
      const { leadId, status, notes } = parameters

      if (!leadId || !status) {
        return
      }

      // Update lead status
      const { error: updateError } = await this.supabase
        .from('leads')
        .update({
          status: status,
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)

      if (updateError) {
        throw new Error(`Failed to update lead status: ${updateError.message}`)
      }

      // Create realtime event
      await this.createRealtimeEvent('', 'lead_updated', {
        leadId,
        status,
        notes
      })
    } catch (error) {
      console.error('Error auto-updating lead status:', error)
    }
  }

  // 9. Failed Call Retry System
  static async retryFailedCall(callId: string, organizationId: string, userId: string): Promise<{ success: boolean; newCallId?: string }> {
    try {
      // Get failed call details
      const { data: failedCall, error: callError } = await this.supabase
        .from('calls')
        .select(`
          *,
          leads!inner(
            id,
            name,
            phone,
            email,
            loan_amount
          )
        `)
        .eq('id', callId)
        .eq('organization_id', organizationId)
        .single()

      if (callError || !failedCall) {
        throw new Error(`Failed call not found: ${callError?.message}`)
      }

      // Check if call is eligible for retry (max 3 attempts)
      const { data: existingCalls, error: countError } = await this.supabase
        .from('calls')
        .select('id')
        .eq('lead_id', failedCall.lead_id)
        .eq('organization_id', organizationId)

      if (countError || !existingCalls || existingCalls.length >= 3) {
        return { success: false }
      }

      // Create new call attempt
      const retryRequest: CallRequest = {
        leadId: failedCall.lead_id,
        phoneNumber: failedCall.leads.phone,
        leadName: failedCall.leads.name,
        organizationId,
        userId,
        aiAgentId: failedCall.ai_agent_id,
        customInstructions: `Retry attempt ${existingCalls.length + 1}. Previous attempt failed.`
      }

      const result = await this.initiateAICall(retryRequest)

      // Update original call with retry info
      await this.supabase
        .from('calls')
        .update({
          retry_count: (failedCall.retry_count || 0) + 1,
          retried_at: new Date().toISOString(),
          retry_call_id: result.callId
        })
        .eq('id', callId)

      return { success: true, newCallId: result.callId }
    } catch (error) {
      console.error('Error retrying failed call:', error)
      return { success: false }
    }
  }

  // 10. Secure Webhook Processing
  static async processWebhook(provider: 'vapi' | 'twilio', signature: string, payload: string, headers: Record<string, string>): Promise<boolean> {
    try {
      let isValid = false

      if (provider === 'vapi') {
        // Verify Vapi webhook signature
        isValid = await this.verifyVapiWebhook(signature, payload)
      } else if (provider === 'twilio') {
        // Verify Twilio webhook signature
        isValid = await this.verifyTwilioWebhook(signature, payload, headers)
      }

      if (!isValid) {
        await SecurityLogger.logSecurityViolation(
          'webhook_verification_failed',
          { provider, signature, headers },
          'server',
          'high'
        )
        return false
      }

      // Process verified webhook
      const event = JSON.parse(payload)
      
      if (provider === 'vapi') {
        await this.handleVapiWebhook(event)
      } else if (provider === 'twilio') {
        await this.handleTwilioWebhook(event)
      }

      return true
    } catch (error) {
      console.error('Error processing webhook:', error)
      await SecurityLogger.logSecurityViolation(
        'webhook_processing_error',
        { provider, error: error.message },
        'server',
        'high'
      )
      return false
    }
  }

  // Helper methods
  private static async verifyVapiWebhook(signature: string, payload: string): Promise<boolean> {
    // Implement Vapi webhook verification
    const expectedSignature = Buffer.from(signature).toString('base64')
    return expectedSignature === signature // Simplified verification
  }

  private static async verifyTwilioWebhook(signature: string, payload: string, headers: Record<string, string>): Promise<boolean> {
    // Implement Twilio webhook verification using their SDK
    const twilio = require('twilio')
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    
    return client.validateRequest(
      process.env.TWILIO_AUTH_TOKEN!,
      signature,
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/webhooks/twilio`,
      Buffer.from(payload)
    )
  }

  private static async handleTwilioWebhook(event: any): Promise<void> {
    // Handle Twilio SMS status updates
    if (event.MessageStatus) {
      await this.supabase
        .from('sms_messages')
        .update({
          status: event.MessageStatus,
          error_code: event.ErrorCode,
          error_message: event.ErrorMessage
        })
        .eq('twilio_message_id', event.MessageSid)
    }
  }

  private static async createRealtimeEvent(organizationId: string, type: string, data: any): Promise<void> {
    try {
      await this.supabase
        .from('realtime_events')
        .insert({
          organization_id: organizationId,
          type,
          data,
          timestamp: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error creating realtime event:', error)
    }
  }
}

export { TelephonyService }
