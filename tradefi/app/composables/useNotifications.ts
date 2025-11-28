import { toast } from 'vue-sonner'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'trade' | 'position'
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

// In-memory notification store (you can replace this with Supabase later)
const notifications = ref<Notification[]>([])

export function useNotifications() {
  // Add a notification
  function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false
    }
    
    notifications.value.unshift(newNotification)
    
    // Also show as toast
    showToast(notification.type, notification.title, notification.message)
    
    // Keep only last 50 notifications
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
  }

  // Show toast notification
  function showToast(type: Notification['type'], title: string, message?: string) {
    const description = message || ''
    
    switch (type) {
      case 'success':
        toast.success(title, { description })
        break
      case 'error':
        toast.error(title, { description })
        break
      case 'warning':
        toast.warning(title, { description })
        break
      case 'trade':
        toast.success(title, { 
          description,
          icon: '💰',
          duration: 5000
        })
        break
      case 'position':
        toast.info(title, { 
          description,
          icon: '📊',
          duration: 5000
        })
        break
      default:
        toast.info(title, { description })
    }
  }

  // Mark notification as read
  function markAsRead(id: string) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  // Mark all as read
  function markAllAsRead() {
    notifications.value.forEach(n => n.read = true)
  }

  // Delete notification
  function deleteNotification(id: string) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  // Clear all notifications
  function clearAll() {
    notifications.value = []
  }

  // Get unread count
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  // Get recent notifications
  const recentNotifications = computed(() => {
    return notifications.value.slice(0, 10)
  })

  return {
    notifications: readonly(notifications),
    unreadCount,
    recentNotifications,
    addNotification,
    showToast,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  }
}

