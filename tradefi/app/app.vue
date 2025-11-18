<template>
  <UApp class="min-h-screen bg-[#181a1f]">
    <header class="w-full sticky top-0 z-50 bg-[#181a1f] border-b-2 border-gold-500 shadow-lg flex items-center justify-between px-8 py-4">
      <div class="flex items-center gap-3">
        <img 
          src="/Sparky.png" 
          alt="TradeFI Logo" 
          class="h-15 w-15 object-contain"
        />
        <h1 class="text-2xl font-extrabold text-gold tracking-wide">SPARKY</h1>
      </div>
      
      <!-- Desktop Nav -->
      <div class="hidden md:flex items-center gap-4">
        <nav class="flex gap-4">
          <router-link
            v-for="item in navigationItems"
            :key="item.name"
            :to="item.to"
            class="group"
          >
            <UButton
              :icon="item.icon"
              :label="item.name"
              variant="ghost"
              class="px-4 py-2 text-base font-semibold transition-all"
              :class="{
                'bg-gradient-to-r from-gold-400 to-green-500 text-white !border-2 !border-gold-400': $route.path === item.to,
                'text-white': $route.path !== item.to
              }"
            />
          </router-link>
        </nav>

        <!-- Auth Button / User Menu -->
        <div v-if="user" class="relative">
          <UDropdown :items="userMenuItems" :popper="{ placement: 'bottom-end' }">
            <UButton
              :icon="'i-heroicons-user-circle'"
              variant="ghost"
              class="px-3 py-2 text-white hover:text-gold-400 transition-colors"
            >
              <template #trailing>
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-r from-gold-400 to-green-500 flex items-center justify-center text-white font-bold text-sm">
                    {{ userInitials }}
                  </div>
                  <UIcon name="i-heroicons-chevron-down" class="w-4 h-4" />
                </div>
              </template>
            </UButton>
          </UDropdown>
        </div>
        <NuxtLink v-else to="/login">
          <UButton
            icon="i-heroicons-arrow-right-on-rectangle"
            label="Sign In"
            class="bg-gradient-to-r from-gold-400 to-green-500 text-white font-semibold px-4 py-2"
          />
        </NuxtLink>
      </div>
      <!-- Mobile Nav -->
      <div class="md:hidden flex items-center gap-3">
        <!-- Mobile User Avatar or Sign In -->
        <div v-if="user" class="relative">
          <UDropdown :items="userMenuItems" :popper="{ placement: 'bottom-end' }">
            <button class="w-8 h-8 rounded-full bg-gradient-to-r from-gold-400 to-green-500 flex items-center justify-center text-white font-bold text-sm">
              {{ userInitials }}
            </button>
          </UDropdown>
        </div>
        <NuxtLink v-else to="/login">
          <UButton
            icon="i-heroicons-arrow-right-on-rectangle"
            size="sm"
            class="bg-gradient-to-r from-gold-400 to-green-500 text-white font-semibold"
          />
        </NuxtLink>

        <!-- Mobile Menu Toggle -->
        <button @click="showMobileNav = !showMobileNav" class="focus:outline-none">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="text-gold">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <transition name="fade">
          <div v-if="showMobileNav" class="absolute top-16 right-4 bg-[#181a1f] border-2 border-gold-500 rounded-xl shadow-xl p-4 flex flex-col gap-2 z-50 min-w-[180px]">
            <router-link
              v-for="item in navigationItems"
              :key="item.name"
              :to="item.to"
              @click.native="showMobileNav = false"
            >
              <UButton
                :icon="item.icon"
                :label="item.name"
                variant="ghost"
                class="w-full text-base font-semibold justify-start"
                :class="{
                  'bg-gradient-to-r from-gold-400 to-green-500 text-white !border-2 !border-gold-400': $route.path === item.to,
                  'text-white': $route.path !== item.to
                }"
              />
            </router-link>
          </div>
        </transition>
      </div>
    </header>
    <main class="pt-8 px-2 md:px-8">
      <NuxtPage />
    </main>
  </UApp>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const showMobileNav = ref(false)
const $route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const navigationItems = [
  { name: 'Dashboard', to: '/', icon: 'i-heroicons-home' },
  { name: 'Performance', to: '/performance', icon: 'i-heroicons-chart-pie' },
  { name: 'Trade Settings', to: '/trade-settings', icon: 'i-heroicons-adjustments-horizontal' },
  { name: 'Strategies', to: '/strategies', icon: 'i-heroicons-chart-bar' },
  { name: 'Account', to: '/account', icon: 'i-heroicons-user-circle' },
]

// Get user initials from email
const userInitials = computed(() => {
  if (!user.value?.email) return '?'
  const email = user.value.email
  const name = email.split('@')[0]
  return name.substring(0, 2).toUpperCase()
})

// User dropdown menu items
const userMenuItems = [
  [{
    label: user.value?.email || 'User',
    slot: 'account',
    disabled: true
  }],
  [{
    label: 'Account Settings',
    icon: 'i-heroicons-cog-6-tooth',
    click: () => router.push('/account')
  }],
  [{
    label: 'Sign Out',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: async () => {
      await supabase.auth.signOut()
      router.push('/login')
    }
  }]
]
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.UButton:hover, button:hover, .btn:hover {
  background: linear-gradient(90deg, var(--color-green-500), var(--color-gold-400));
  color: #fff !important;
  border-color: var(--color-gold-400);
  box-shadow: 0 0 12px 0 var(--color-gold-400), 0 4px 32px 0 rgba(0,0,0,0.18);
  transform: translateY(-2px) scale(1.04);
}

/* Remove the active-glow class if present */
.active-glow {
  box-shadow: none !important;
}
</style>
