"use client"

import { useEffect, useRef, useState } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import { Database } from './supabase'

export type RealtimeEvent = {
  type: 'lead_created' | 'lead_updated' | 'call_started' | 'call_completed' | 'call_missed' | 'application_completed' | 'customer_transferred'
  data: any
  timestamp: string
  organization_id: string
}

export type Notification = {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  organization_id: string
  action_url?: string
}

class RealtimeService {
  private static getSupabase() {
    return createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  
  private static channels = new Map<string, RealtimeChannel>()
  private static listeners = new Map<string, Set<(event: RealtimeEvent) => void>>()
  private static notificationListeners = new Set<(notification: Notification) => void>()

  // Subscribe to real-time updates
  static subscribe(
    organizationId: string,
    eventTypes: RealtimeEvent['type'][],
    callback: (event: RealtimeEvent) => void
  ) {
    const channelName = `organization:${organizationId}`
    
    if (!this.listeners.has(channelName)) {
      this.listeners.set(channelName, new Set())
    }
    
    this.listeners.get(channelName)?.add(callback)

    // Create or get existing channel
    if (!this.channels.has(channelName)) {
      const channel = this.getSupabase()
        .channel(channelName)
        .on('postgres_changes', 
          { event: '*', schema: 'public' }, 
          (payload) => {
            const event = payload.new as any
            
            // Filter by organization and event types
            if (event.organization_id === organizationId && 
                eventTypes.includes(event.type)) {
              
              const realtimeEvent: RealtimeEvent = {
                type: event.type,
                data: event.data || event,
                timestamp: event.timestamp || new Date().toISOString(),
                organization_id: event.organization_id
              }

              // Notify all listeners
              this.listeners.get(channelName)?.forEach(listener => {
                listener(realtimeEvent)
              })

              // Auto-generate notifications for important events
              this.generateNotification(realtimeEvent)
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Subscribed to ${channelName}`)
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`Error subscribing to ${channelName}`)
          }
        })

      this.channels.set(channelName, channel)
    }
  }

  // Unsubscribe from real-time updates
  static unsubscribe(organizationId: string, callback?: (event: RealtimeEvent) => void) {
    const channelName = `organization:${organizationId}`
    const channel = this.channels.get(channelName)
    
    if (channel) {
      if (callback) {
        this.listeners.get(channelName)?.delete(callback)
      } else {
        this.listeners.delete(channelName)
      }
      
      // Unsubscribe channel if no more listeners
      if (!this.listeners.has(channelName)) {
        this.getSupabase().removeChannel(channel)
        this.channels.delete(channelName)
      }
    }
  }

  // Add notification listener
  static onNotification(callback: (notification: Notification) => void) {
    this.notificationListeners.add(callback)
  }

  // Remove notification listener
  static offNotification(callback: (notification: Notification) => void) {
    this.notificationListeners.delete(callback)
  }

  // Generate notifications for important events
  private static generateNotification(event: RealtimeEvent) {
    let notification: Notification | null = null

    switch (event.type) {
      case 'lead_created':
        notification = {
          id: `lead_${Date.now()}`,
          type: 'success',
          title: 'New Lead Created',
          message: `New lead "${event.data.name}" has been added to your pipeline.`,
          timestamp: event.timestamp,
          read: false,
          organization_id: event.organization_id,
          action_url: '/dashboard/leads'
        }
        break

      case 'call_missed':
        notification = {
          id: `missed_${Date.now()}`,
          type: 'warning',
          title: 'Missed Call',
          message: `Call to ${event.data.lead_name} was missed.`,
          timestamp: event.timestamp,
          read: false,
          organization_id: event.organization_id,
          action_url: '/dashboard/calls'
        }
        break

      case 'application_completed':
        notification = {
          id: `app_${Date.now()}`,
          type: 'success',
          title: 'Application Completed',
          message: `Application from ${event.data.lead_name} has been completed.`,
          timestamp: event.timestamp,
          read: false,
          organization_id: event.organization_id,
          action_url: `/dashboard/leads/${event.data.lead_id}`
        }
        break

      case 'customer_transferred':
        notification = {
          id: `transferred_${Date.now()}`,
          type: 'info',
          title: 'Customer Transferred',
          message: `${event.data.lead_name} has been transferred to processing.`,
          timestamp: event.timestamp,
          read: false,
          organization_id: event.organization_id,
          action_url: `/dashboard/leads/${event.data.lead_id}`
        }
        break

      case 'call_completed':
        if (event.data.outcome === 'connected') {
          notification = {
            id: `call_${Date.now()}`,
            type: 'success',
            title: 'Call Completed',
            message: `Successful call with ${event.data.lead_name} (${event.data.duration}s).`,
            timestamp: event.timestamp,
            read: false,
            organization_id: event.organization_id,
            action_url: '/dashboard/calls'
          }
        }
        break
    }

    if (notification) {
      this.notificationListeners.forEach(listener => {
        listener(notification)
      })
    }
  }

  // Get active channels count
  static getActiveChannelsCount(): number {
    return this.channels.size
  }

  // Cleanup all subscriptions
  static cleanup() {
    this.channels.forEach((channel) => {
      this.getSupabase().removeChannel(channel)
    })
    this.channels.clear()
    this.listeners.clear()
    this.notificationListeners.clear()
  }
}

// React hook for real-time updates
export function useRealtime(organizationId: string, eventTypes: RealtimeEvent['type'][]) {
  const [events, setEvents] = useState<RealtimeEvent[]>([])
  const organizationIdRef = useRef(organizationId)
  const eventTypesRef = useRef(eventTypes)

  useEffect(() => {
    // Update refs if they change
    organizationIdRef.current = organizationId
    eventTypesRef.current = eventTypes

    const handleRealtimeEvent = (event: RealtimeEvent) => {
      setEvents(prev => {
        // Keep only last 100 events to prevent memory issues
        const updated = [event, ...prev].slice(0, 100)
        return updated
      })
    }

    // Subscribe to real-time updates
    RealtimeService.subscribe(organizationId, eventTypes, handleRealtimeEvent)

    // Cleanup on unmount
    return () => {
      RealtimeService.unsubscribe(organizationId, handleRealtimeEvent)
    }
  }, [organizationId, eventTypes])

  return events
}

// React hook for notifications
export function useNotifications(organizationId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const handleNotification = (notification: Notification) => {
      setNotifications(prev => {
        const updated = [notification, ...prev].slice(0, 50) // Keep last 50 notifications
        return updated
      })
      
      // Update unread count
      setUnreadCount(prev => prev + 1)
    }

    RealtimeService.onNotification(handleNotification)

    return () => {
      RealtimeService.offNotification(handleNotification)
    }
  }, [organizationId])

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
    setUnreadCount(0)
  }

  const clearNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications
  }
}

export { RealtimeService }
