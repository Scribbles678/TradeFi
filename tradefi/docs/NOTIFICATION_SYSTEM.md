# 🔔 Notification System Guide

## Overview

TradeFI now has a complete notification system with:
- **Toast Notifications** - Quick, auto-dismissing alerts (using vue-sonner)
- **Notification Center** - Persistent notification list (click the bell icon)
- **Customizable Alert Types** - Success, Error, Warning, Info, Trade, Position

---

## 🚀 Quick Start

### 1. Using Toast Notifications

```typescript
import { useNotifications } from '~/composables/useNotifications'

const { showToast } = useNotifications()

// Success notification
showToast('success', 'Trade Executed', 'BTCUSDT buy order filled at $45,000')

// Error notification
showToast('error', 'Connection Failed', 'Unable to connect to OANDA API')

// Trade-specific notification
showToast('trade', 'Position Closed', 'SOLUSDT position closed with +$1,400 profit')

// Position alert
showToast('position', 'Stop Loss Hit', 'ETHUSDT position stopped out at $2,280')
```

### 2. Adding Persistent Notifications

```typescript
import { useNotifications } from '~/composables/useNotifications'

const { addNotification } = useNotifications()

// Add a notification that appears in the notification center
addNotification({
  type: 'trade',
  title: 'Trade Executed',
  message: 'BTCUSDT buy order filled at $45,000. Position size: $22,250',
  action: {
    label: 'View Trade',
    onClick: () => {
      // Navigate to trade details
      navigateTo('/trades')
    }
  }
})
```

---

## 📋 Notification Types

| Type | Use Case | Icon | Color |
|------|----------|------|-------|
| `success` | Successful operations | ✅ | Green |
| `error` | Errors, failures | ❌ | Red |
| `warning` | Warnings, cautions | ⚠️ | Yellow |
| `info` | General information | ℹ️ | Blue |
| `trade` | Trade executions | 💰 | Green |
| `position` | Position updates | 📊 | Blue |

---

## 🎯 Common Use Cases

### Trade Execution Notifications

```typescript
// When a trade is executed
addNotification({
  type: 'trade',
  title: 'Trade Executed',
  message: `${symbol} ${side} order filled at $${entryPrice}`,
  action: {
    label: 'View Position',
    onClick: () => navigateTo('/positions')
  }
})
```

### Position Alerts

```typescript
// Stop loss hit
addNotification({
  type: 'position',
  title: 'Stop Loss Triggered',
  message: `${symbol} position stopped out. Loss: $${loss}`,
  action: {
    label: 'View Trade',
    onClick: () => navigateTo(`/trades/${tradeId}`)
  }
})

// Take profit hit
addNotification({
  type: 'success',
  title: 'Take Profit Reached',
  message: `${symbol} position closed with profit: $${profit}`,
})
```

### Connection Status

```typescript
// Connection lost
addNotification({
  type: 'error',
  title: 'Connection Lost',
  message: 'Lost connection to Aster DEX. Attempting to reconnect...'
})

// Connection restored
addNotification({
  type: 'success',
  title: 'Connection Restored',
  message: 'Successfully reconnected to all exchanges'
})
```

### Strategy Alerts

```typescript
// Strategy activated
addNotification({
  type: 'info',
  title: 'Strategy Activated',
  message: 'Momentum Breakout strategy is now active'
})

// Strategy error
addNotification({
  type: 'error',
  title: 'Strategy Error',
  message: 'Forex Scalper encountered an error: Invalid API response'
})
```

---

## 🔧 Advanced Features

### Custom Notification Actions

```typescript
addNotification({
  type: 'trade',
  title: 'Large Position Opened',
  message: 'BTCUSDT position exceeds risk limit',
  action: {
    label: 'Review Settings',
    onClick: () => {
      navigateTo('/trade-settings')
    }
  }
})
```

### Real-time Notifications (Future)

You can extend this to use Supabase Realtime:

```typescript
// In a composable or page
const supabase = useSupabaseClient()

supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'trades'
  }, (payload) => {
    addNotification({
      type: 'trade',
      title: 'New Trade',
      message: `Trade executed: ${payload.new.symbol}`
    })
  })
  .subscribe()
```

---

## 🎨 Customization Options

### Toast Duration

```typescript
import { toast } from 'vue-sonner'

// Custom duration (default is 4000ms)
toast.success('Trade Executed', {
  description: 'Your order was filled',
  duration: 10000 // 10 seconds
})
```

### Toast Position

Configure in `app/components/ui/sonner/Sonner.vue`:

```vue
<Sonner
  position="top-right"  // or "top-left", "bottom-right", "bottom-left", "top-center", "bottom-center"
  ...
/>
```

### Notification Persistence

Currently notifications are stored in memory. To persist:

1. **Supabase Table:**
```sql
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  type text NOT NULL,
  title text NOT NULL,
  message text,
  read boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);
```

2. **Update composable** to fetch from Supabase instead of in-memory array.

---

## 📱 Notification Center Features

The notification center (bell icon) provides:

- ✅ **Unread Badge** - Shows count of unread notifications
- ✅ **Mark as Read** - Click notification or use "Mark all read"
- ✅ **Delete** - Remove individual notifications
- ✅ **Clear All** - Remove all notifications
- ✅ **Action Buttons** - Quick actions from notifications
- ✅ **Time Stamps** - Relative time display (e.g., "5m ago")

---

## 🔮 Future Enhancements

### Possible Additions:

1. **Email Notifications** - Send email for critical alerts
2. **Push Notifications** - Browser push notifications
3. **Sound Alerts** - Audio notifications for trades
4. **Notification Preferences** - User settings for what to notify
5. **Notification Filters** - Filter by type, date, etc.
6. **Notification Groups** - Group similar notifications
7. **Scheduled Notifications** - Notify at specific times
8. **Webhook Notifications** - Send to external services

---

## 💡 Best Practices

1. **Use Toast for Temporary Alerts** - Quick feedback that auto-dismisses
2. **Use Notification Center for Important Events** - Things users should review
3. **Don't Over-Notify** - Too many notifications = ignored notifications
4. **Use Appropriate Types** - Match notification type to severity
5. **Include Actions When Useful** - Make notifications actionable
6. **Keep Messages Concise** - Short, clear messages work best

---

## 🐛 Troubleshooting

### Toasts not showing?
- Make sure `<Toaster />` is in your layout (it's already added)
- Check browser console for errors
- Verify vue-sonner is installed: `npm list vue-sonner`

### Notification center not opening?
- Verify Sheet component exists: `app/components/ui/sheet/`
- Check browser console for errors
- Make sure NotificationCenter component is imported correctly

---

## 📚 Resources

- [vue-sonner Documentation](https://github.com/wobsoriano/vue-sonner)
- [ShadCN Sheet Component](https://ui.shadcn.com/docs/components/sheet)

