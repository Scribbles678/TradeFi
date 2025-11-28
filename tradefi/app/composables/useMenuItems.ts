import {
  Home,
  TrendingUp,
  Settings,
  BarChart3,
  User,
  Wallet,
  Link2,
  CreditCard
} from 'lucide-vue-next'

import { useRoute } from 'vue-router'
import { computed } from 'vue'

export const useMenuItems = () => {
  const route = useRoute()
  const user = useSupabaseUser()

  const MenuItems = computed(() => ({
    user: {
      name: user.value?.email?.split('@')[0] || 'User',
      email: user.value?.email || 'user@example.com',
      avatar: user.value?.user_metadata?.avatar_url || ''
    },
    navTrading: [
      {
        title: 'Dashboard',
        url: '/',
        icon: Home,
        isActive: route.path === '/'
      },
      {
        title: 'Performance',
        url: '/performance',
        icon: TrendingUp,
        isActive: route.path === '/performance'
      },
      {
        title: 'Trade Settings',
        url: '/trade-settings',
        icon: Settings,
        isActive: route.path === '/trade-settings'
      },
      {
        title: 'Strategies',
        url: '/strategies',
        icon: BarChart3,
        isActive: route.path === '/strategies'
      }
    ],
    navAccount: [
      {
        title: 'Overview',
        url: '/account',
        icon: User,
        isActive: route.path === '/account'
      },
      {
        title: 'Exchanges',
        url: '/account/exchange-accounts',
        icon: Wallet,
        isActive: route.path === '/account/exchange-accounts'
      },
      {
        title: 'Webhook',
        url: '/account/webhook',
        icon: Link2,
        isActive: route.path === '/account/webhook'
      },
      {
        title: 'Subscription',
        url: '/account/subscription',
        icon: CreditCard,
        isActive: route.path === '/account/subscription'
      }
    ]
  }))

  return {
    MenuItems
  }
}

