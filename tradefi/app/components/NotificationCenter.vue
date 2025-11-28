<script setup lang="ts">
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-vue-next'
import { useNotifications } from '~/composables/useNotifications'

const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications()
const isOpen = ref(false)

function formatTime(date: Date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'success':
      return '✅'
    case 'error':
      return '❌'
    case 'warning':
      return '⚠️'
    case 'trade':
      return '💰'
    case 'position':
      return '📊'
    default:
      return 'ℹ️'
  }
}

function getNotificationColor(type: string) {
  switch (type) {
    case 'success':
    case 'trade':
      return 'text-green-400'
    case 'error':
      return 'text-red-400'
    case 'warning':
      return 'text-yellow-400'
    case 'position':
      return 'text-blue-400'
    default:
      return 'text-muted-foreground'
  }
}
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetTrigger as-child>
      <Button
        variant="outline"
        size="icon"
        class="relative"
      >
        <Bell class="h-4 w-4" />
        <Badge
          v-if="unreadCount > 0"
          variant="destructive"
          class="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </Badge>
      </Button>
    </SheetTrigger>
    <SheetContent class="w-full sm:max-w-md">
      <SheetHeader>
        <div class="flex items-center justify-between">
          <SheetTitle>Notifications</SheetTitle>
          <div class="flex items-center gap-2">
            <Button
              v-if="unreadCount > 0"
              variant="ghost"
              size="sm"
              @click="markAllAsRead"
            >
              <CheckCheck class="h-4 w-4 mr-1" />
              Mark all read
            </Button>
            <Button
              v-if="notifications.length > 0"
              variant="ghost"
              size="sm"
              @click="clearAll"
            >
              <Trash2 class="h-4 w-4 mr-1" />
              Clear all
            </Button>
          </div>
        </div>
      </SheetHeader>
      
      <div class="mt-6">
        <div v-if="notifications.length === 0" class="text-center py-12">
          <Bell class="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p class="text-muted-foreground">No notifications</p>
          <p class="text-sm text-muted-foreground mt-1">You're all caught up!</p>
        </div>
        
        <div v-else class="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            :class="[
              'flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted',
              !notification.read ? 'bg-muted/50 border-primary/20' : 'bg-card'
            ]"
            @click="markAsRead(notification.id)"
          >
            <div :class="['text-2xl flex-shrink-0', getNotificationColor(notification.type)]">
              {{ getNotificationIcon(notification.type) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <p :class="['font-semibold text-sm', !notification.read ? 'text-foreground' : 'text-muted-foreground']">
                    {{ notification.title }}
                  </p>
                  <p class="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {{ notification.message }}
                  </p>
                  <p class="text-xs text-muted-foreground mt-1">
                    {{ formatTime(notification.timestamp) }}
                  </p>
                </div>
                <div class="flex items-center gap-1 flex-shrink-0">
                  <Button
                    v-if="!notification.read"
                    variant="ghost"
                    size="icon"
                    class="h-6 w-6"
                    @click.stop="markAsRead(notification.id)"
                  >
                    <Check class="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-6 w-6"
                    @click.stop="deleteNotification(notification.id)"
                  >
                    <X class="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Button
                v-if="notification.action"
                variant="outline"
                size="sm"
                class="mt-2"
                @click.stop="notification.action?.onClick"
              >
                {{ notification.action.label }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>

