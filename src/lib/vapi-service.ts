import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export class VapiService {
  private apiKey: string
  private baseUrl = 'https://api.vapi.ai'

  constructor() {
    this.apiKey = process.env.VAPI_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('VAPI_API_KEY environment variable is required')
    }
  }

  async createCall(phoneNumber: string, assistantId?: string) {
    try {
      const defaultAssistantId = process.env.VAPI_DEFAULT_ASSISTANT_ID
      
      const payload = {
        assistantId: assistantId || defaultAssistantId,
        phoneNumber: {
          twilio: {
            phoneNumber: process.env.TWILIO_PHONE_NUMBER
          }
        },
        customer: {
          number: phoneNumber
        },
        analysisPlan: {
          summary: 'Summarize the call',
          successProbability: true,
          sentiment: true,
          keyTopics: true
        }
      }

      const response = await fetch(`${this.baseUrl}/call`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Vapi API error: ${response.status} ${response.statusText}`)
      }

      const callData = await response.json()
      return callData
    } catch (error) {
      console.error('Error creating Vapi call:', error)
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

      if (!response.ok) {
        throw new Error(`Vapi API error: ${response.status} ${response.statusText}`)
      }

      const callData = await response.json()
      return callData
    } catch (error) {
      console.error('Error getting Vapi call status:', error)
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

      if (!response.ok) {
        throw new Error(`Vapi API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error ending Vapi call:', error)
      throw error
    }
  }

  async updateCallInDatabase(callId: string, status: string, outcome?: string, duration?: number) {
    try {
      const supabase = await createClient()

      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (outcome) {
        updateData.outcome = outcome
      }

      if (duration !== undefined) {
        updateData.duration = duration
      }

      const { data, error } = await supabase
        .from('calls')
        .update(updateData)
        .eq('id', callId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error updating call in database:', error)
      throw error
    }
  }

  async processCallWebhook(callData: any) {
    try {
      const supabase = await createClient()

      // Find the call in our database
      const { data: call, error: callError } = await supabase
        .from('calls')
        .select('*')
        .eq('call_sid', callData.id)
        .single()

      if (callError || !call) {
        console.warn('Call not found in database for webhook:', callData.id)
        return null
      }

      // Update call status based on webhook data
      const status = this.mapVapiStatusToOurStatus(callData.status)
      const outcome = callData.analysis?.successProbability > 0.7 ? 'connected' : 'not_connected'
      const duration = callData.duration

      // Update call record
      const { data: updatedCall, error: updateError } = await supabase
        .from('calls')
        .update({
          status,
          outcome,
          duration,
          recording_url: callData.recordingUrl,
          transcription: callData.transcript,
          updated_at: new Date().toISOString()
        })
        .eq('id', call.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Create recording record if available
      if (callData.recordingUrl) {
        await supabase
          .from('recordings')
          .insert({
            organization_id: call.organization_id,
            call_id: call.id,
            file_url: callData.recordingUrl,
            duration: duration || 0,
            transcription: callData.transcript,
            summary: callData.analysis?.summary,
            sentiment_score: callData.analysis?.sentiment,
            key_topics: callData.analysis?.keyTopics || [],
            created_at: new Date().toISOString()
          })
      }

      // Update lead status if call was successful
      if (outcome === 'connected') {
        await supabase
          .from('leads')
          .update({ status: 'contacted' })
          .eq('id', call.lead_id)
      }

      return updatedCall
    } catch (error) {
      console.error('Error processing Vapi webhook:', error)
      throw error
    }
  }

  private mapVapiStatusToOurStatus(vapiStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'queued': 'scheduled',
      'initiated': 'in_progress',
      'ringing': 'in_progress',
      'in-progress': 'in_progress',
      'ended': 'completed',
      'failed': 'failed',
      'busy': 'missed',
      'no-answer': 'missed'
    }

    return statusMap[vapiStatus] || 'unknown'
  }
}

export function getVapiService() {
  return new VapiService()
}
