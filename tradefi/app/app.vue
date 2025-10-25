<template>
  <UApp class="min-h-screen bg-[#181a1f]">
    <header class="w-full sticky top-0 z-50 bg-[#181a1f] border-b-2 border-gold-500 shadow-lg flex items-center justify-between px-8 py-4">
      <h1 class="text-2xl font-extrabold text-gold tracking-wide">TRADEFI</h1>
      <!-- Desktop Nav -->
      <nav class="hidden md:flex gap-4">
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
      <!-- Mobile Nav -->
      <div class="md:hidden flex items-center">
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
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const showMobileNav = ref(false)
const $route = useRoute()

const navigationItems = [
  { name: 'Dashboard', to: '/', icon: 'i-heroicons-home' },
  { name: 'Performance', to: '/performance', icon: 'i-heroicons-chart-pie' },
  { name: 'Strategies', to: '/strategies', icon: 'i-heroicons-chart-bar' },
  { name: 'Account', to: '/account', icon: 'i-heroicons-user-circle' },
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
