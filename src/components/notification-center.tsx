"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Bell, 
  X, 
  Check, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  ChevronDown,
  User,
  Phone,
  FileCheck,
  ArrowRight
} from "lucide-react"
import { useNotifications, type Notification } from "@/lib/realtime-service"

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return <Check className="h-4 w-4 text-green-600" />
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-600" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    case 'info':
    default:
      return <Info className="h-4 w-4 text-blue-600" />
  }
}

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'border-green-200 bg-green-50 hover:bg-green-100'
    case 'error':
      return 'border-red-200 bg-red-50 hover:bg-red-100'
    case 'warning':
      return 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100'
    case 'info':
    default:
      return 'border-blue-200 bg-blue-50 hover:bg-blue-100'
  }
}

const getNotificationIconBg = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-100'
    case 'error':
      return 'bg-red-100'
    case 'warning':
      return 'bg-yellow-100'
    case 'info':
    default:
      return 'bg-blue-100'
  }
}

const formatTimeAgo = (timestamp: string) => {
  const now = new Date()
  const past = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
}

interface NotificationCenterProps {
  organizationId?: string
}

export function NotificationCenter({ organizationId }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = 
    useNotifications(organizationId)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    if (notification.action_url) {
      window.location.href = notification.action_url
    }
    setIsOpen(false)
  }

  const displayNotifications = showAll ? notifications : notifications.slice(0, 5)

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 transition-all duration-200 hover:bg-gray-100"
      >
        <Bell className="h-5 w-5" />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center animate-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in slide-in-from-top-1 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsRead()}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  You'll see notifications here when new leads, calls, or applications are created.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {displayNotifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`p-4 cursor-pointer transition-all duration-200 ${
                      notification.read 
                        ? 'bg-white hover:bg-gray-50' 
                        : getNotificationColor(notification.type)
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                    style={{
                      animation: `slideInRight 0.3s ease-out ${index * 0.05}s both`
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className={`p-2 rounded-full ${getNotificationIconBg(notification.type)} flex-shrink-0`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0" />
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                          
                          {notification.action_url && (
                            <div className="flex items-center text-blue-600 text-xs hover:text-blue-700">
                              View
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 5 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="w-full text-blue-600 hover:text-blue-700"
              >
                {showAll ? (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2 rotate-180" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Show All ({notifications.length})
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Clear All Button */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearNotifications()}
                className="w-full text-red-600 hover:text-red-700"
              >
                Clear All Notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Live Activity Feed Component
export function LiveActivityFeed({ organizationId }: { organizationId: string }) {
  const [activities, setActivities] = useState<any[]>([])
  const { useRealtime } = require('@/lib/realtime-service')
  
  const realtimeEvents = useRealtime(organizationId, [
    'lead_created', 'lead_updated', 'call_started', 'call_completed', 
    'call_missed', 'application_completed', 'customer_transferred'
  ])

  useEffect(() => {
    const newActivities = realtimeEvents.map(event => ({
      id: `${event.type}_${event.timestamp}`,
      type: event.type,
      data: event.data,
      timestamp: event.timestamp
    }))
    
    setActivities(prev => [...newActivities, ...prev].slice(0, 20))
  }, [realtimeEvents])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lead_created':
        return <User className="h-4 w-4 text-blue-600" />
      case 'call_started':
      case 'call_completed':
      case 'call_missed':
        return <Phone className="h-4 w-4 text-green-600" />
      case 'application_completed':
        return <FileCheck className="h-4 w-4 text-purple-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
          Live Activity
        </h3>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              No recent activity
            </p>
          ) : (
            activities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                style={{
                  animation: `slideInRight 0.3s ease-out ${index * 0.05}s both`
                }}
              >
                <div className="p-2 bg-white rounded-full shadow-sm flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-gray-900">
                      {activity.type.replace('_', ' ').toUpperCase()}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.data?.name || activity.data?.lead_name || 'Activity detected'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Add custom animations to global styles
const style = document.createElement('style')
style.textContent = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideInFromTop {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-in {
    animation-duration: 200ms;
    animation-fill-mode: both;
  }
  
  .slide-in-from-top-1 {
    animation-name: slideInFromTop;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`
document.head.appendChild(style)
