import {
  Home,
  TrendingUp,
  Settings,
  BarChart3,
  User
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
    navMain: [
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
      },
      {
        title: 'Account',
        url: '/account',
        icon: User,
        isActive: route.path === '/account'
      }
    ]
  }))

  return {
    MenuItems
  }
}

