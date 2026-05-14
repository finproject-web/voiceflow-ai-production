import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'
import { Database } from './supabase'

// Service interfaces - abstracted from provider names
interface VoiceService {
  initiateCall(phone: string, leadId: string, organizationId: string): Promise<any>
  getCallStatus(callId: string): Promise<any>
  endCall(callId: string): Promise<any>
}

interface SMSService {
  sendSMS(phone: string, message: string): Promise<any>
  getDeliveryStatus(messageId: string): Promise<any>
}

interface WorkflowService {
  triggerWorkflow(eventType: string, data: any): Promise<any>
  getWorkflowStatus(workflowId: string): Promise<any>
}

// Vapi Integration (Voice Service)
class VoiceProvider implements VoiceService {
  private apiKey: string
  private baseUrl = 'https://api.vapi.ai'

  constructor() {
    this.apiKey = process.env.VOICE_SERVICE_API_KEY!
  }

  async initiateCall(phone: string, leadId: string, organizationId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/call`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: phone,
          assistantId: process.env.VOICE_ASSISTANT_ID,
          customer: {
            number: phone
          },
          metadata: {
            leadId,
            organizationId
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Voice service error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Voice service error:', error)
      throw error
    }
  }

  async getCallStatus(callId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/call/${callId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      return await response.json()
    } catch (error) {
      console.error('Call status error:', error)
      throw error
    }
  }

  async endCall(callId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/call/${callId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      return await response.json()
    } catch (error) {
      console.error('End call error:', error)
      throw error
    }
  }
}

// Twilio Integration (SMS Service)
class SMSProvider implements SMSService {
  private accountSid: string
  private authToken: string
  private fromNumber: string

  constructor() {
    this.accountSid = process.env.SMS_ACCOUNT_SID!
    this.authToken = process.env.SMS_AUTH_TOKEN!
    this.fromNumber = process.env.SMS_FROM_NUMBER!
  }

  async sendSMS(phone: string, message: string) {
    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`
          },
          body: new URLSearchParams({
            From: this.fromNumber,
            To: phone,
            Body: message
          })
        }
      )

      if (!response.ok) {
        throw new Error(`SMS service error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('SMS service error:', error)
      throw error
    }
  }

  async getDeliveryStatus(messageId: string) {
    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages/${messageId}.json`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`
          }
        }
      )

      return await response.json()
    } catch (error) {
      console.error('SMS status error:', error)
      throw error
    }
  }
}

// Make.com Integration (Workflow Service)
class WorkflowProvider implements WorkflowService {
  private apiKey: string
  private baseUrl = 'https://api.make.com/v2'

  constructor() {
    this.apiKey = process.env.WORKFLOW_API_KEY!
  }

  async triggerWorkflow(eventType: string, data: any) {
    try {
      const workflowId = this.getWorkflowIdByEvent(eventType)
      
      const response = await fetch(`${this.baseUrl}/scenarios/${workflowId}/executions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          body: {
            ...data,
            timestamp: new Date().toISOString(),
            source: 'voiceflow-ai'
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Workflow service error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Workflow service error:', error)
      throw error
    }
  }

  async getWorkflowStatus(workflowId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/executions/${workflowId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      return await response.json()
    } catch (error) {
      console.error('Workflow status error:', error)
      throw error
    }
  }

  private getWorkflowIdByEvent(eventType: string): string {
    const workflows: Record<string, string> = {
      'lead.created': process.env.WORKFLOW_LEAD_CREATED!,
      'call.completed': process.env.WORKFLOW_CALL_COMPLETED!,
      'call.failed': process.env.WORKFLOW_CALL_FAILED!,
      'payment.completed': process.env.WORKFLOW_PAYMENT_COMPLETED!
    }

    return workflows[eventType] || workflows['lead.created']
  }
}

// Service factory - abstracts provider details
export class BackendService {
  private static voiceService: VoiceService
  private static smsService: SMSService
  private static workflowService: WorkflowService

  static {
    this.voiceService = new VoiceProvider()
    this.smsService = new SMSProvider()
    this.workflowService = new WorkflowProvider()
  }

  // Voice operations
  static async initiateCall(phone: string, leadId: string, organizationId: string) {
    return this.voiceService.initiateCall(phone, leadId, organizationId)
  }

  static async getCallStatus(callId: string) {
    return this.voiceService.getCallStatus(callId)
  }

  static async endCall(callId: string) {
    return this.voiceService.endCall(callId)
  }

  // SMS operations
  static async sendSMS(phone: string, message: string) {
    return this.smsService.sendSMS(phone, message)
  }

  static async getSMSDeliveryStatus(messageId: string) {
    return this.smsService.getDeliveryStatus(messageId)
  }

  // Workflow operations
  static async triggerWorkflow(eventType: string, data: any) {
    return this.workflowService.triggerWorkflow(eventType, data)
  }

  static async getWorkflowStatus(workflowId: string) {
    return this.workflowService.getWorkflowStatus(workflowId)
  }

  // Database operations with service integration
  static async createAndCallLead(leadData: any, organizationId: string) {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      // Create lead
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert({
          ...leadData,
          organization_id: organizationId
        })
        .select()
        .single()

      if (leadError) throw leadError
      if (!lead) throw new Error('Lead insert returned no row')

      // Initiate voice call
      const callResult = await this.initiateCall(
        leadData.phone,
        lead.id,
        organizationId
      )

      // Create call record
      const { data: call, error: callError } = await supabase
        .from('calls')
        .insert({
          id: randomUUID(),
          lead_id: lead.id,
          organization_id: organizationId,
          duration: 0,
          outcome: 'not_connected',
          status: 'in_progress',
          timestamp: new Date().toISOString(),
          external_call_id: callResult.id
        })
        .select()
        .single()

      if (callError) throw callError

      // Trigger workflow
      await this.triggerWorkflow('lead.created', {
        lead,
        call,
        organizationId
      })

      return { lead, call }
    } catch (error) {
      console.error('Create and call lead error:', error)
      throw error
    }
  }
}
