<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Exchange Accounts</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Real-time balances across all exchanges</p>
      </div>
      <UButton
        icon="i-heroicons-arrow-path"
        label="Refresh"
        size="md"
        @click="loadBalances"
        :loading="isLoading"
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
      />
    </div>

    <!-- Total Portfolio Value -->
    <UCard>
      <div class="text-center py-6">
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Portfolio Value</p>
        <p class="text-4xl font-bold">
          ${{ totalBalance.toFixed(2) }}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Last updated: {{ lastUpdate }}
        </p>
      </div>
    </UCard>

    <!-- Exchange Balances -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Aster DEX (Crypto) -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <UIcon name="i-simple-icons-bitcoin" class="text-orange-500" />
              Aster DEX
            </h3>
            <UBadge :color="asterBalance.success ? 'success' : 'error'" size="sm">
              {{ asterBalance.success ? 'Connected' : 'Error' }}
            </UBadge>
          </div>
        </template>
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Balance</p>
            <p class="text-2xl font-bold mt-1">
              ${{ asterBalance.balance?.toFixed(2) ?? '---' }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-500 dark:text-gray-400">Available</p>
              <p class="font-semibold">${{ asterBalance.availableBalance?.toFixed(2) ?? '---' }}</p>
            </div>
            <div>
              <p class="text-gray-500 dark:text-gray-400">Unrealized P&L</p>
              <p :class="[
                'font-semibold',
                (asterBalance.totalUnrealizedPnl ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
              ]">
                {{ (asterBalance.totalUnrealizedPnl ?? 0) >= 0 ? '+' : '' }}${{ asterBalance.totalUnrealizedPnl?.toFixed(2) ?? '0.00' }}
              </p>
            </div>
          </div>
          <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500">Asset Class: <span class="font-semibold">Crypto</span></p>
            <p class="text-xs text-gray-500">Market: <span class="font-semibold">24/7 Trading</span></p>
          </div>
        </div>
      </UCard>

      <!-- OANDA (Forex) -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <UIcon name="i-heroicons-currency-dollar" class="text-green-500" />
              OANDA
            </h3>
            <UBadge :color="oandaBalance.success ? 'success' : 'error'" size="sm">
              {{ oandaBalance.success ? 'Connected' : 'Error' }}
            </UBadge>
          </div>
        </template>
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Balance</p>
            <p class="text-2xl font-bold mt-1">
              ${{ oandaBalance.balance?.toFixed(2) ?? '---' }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-500 dark:text-gray-400">Margin Available</p>
              <p class="font-semibold">${{ oandaBalance.marginAvailable?.toFixed(2) ?? '---' }}</p>
            </div>
            <div>
              <p class="text-gray-500 dark:text-gray-400">Unrealized P&L</p>
              <p :class="[
                'font-semibold',
                (oandaBalance.unrealizedPL ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
              ]">
                {{ (oandaBalance.unrealizedPL ?? 0) >= 0 ? '+' : '' }}${{ oandaBalance.unrealizedPL?.toFixed(2) ?? '0.00' }}
              </p>
            </div>
          </div>
          <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500">Asset Class: <span class="font-semibold">Forex</span></p>
            <p class="text-xs text-gray-500">Market: <span class="font-semibold">24/5 Trading</span></p>
          </div>
        </div>
      </UCard>

      <!-- Tradier (Stocks) -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <UIcon name="i-heroicons-chart-bar" class="text-blue-500" />
              Tradier
            </h3>
            <UBadge :color="tradierBalance.success ? 'success' : 'error'" size="sm">
              {{ tradierBalance.success ? 'Connected' : 'Error' }}
            </UBadge>
          </div>
        </template>
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Equity</p>
            <p class="text-2xl font-bold mt-1">
              ${{ tradierBalance.balance?.toFixed(2) ?? '---' }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-500 dark:text-gray-400">Cash Available</p>
              <p class="font-semibold">${{ tradierBalance.cashAvailable?.toFixed(2) ?? '---' }}</p>
            </div>
            <div>
              <p class="text-gray-500 dark:text-gray-400">Market Value</p>
              <p class="font-semibold">${{ tradierBalance.totalMarketValue?.toFixed(2) ?? '---' }}</p>
            </div>
          </div>
          <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500">Asset Class: <span class="font-semibold">Stocks/Options</span></p>
            <p class="text-xs text-gray-500">Market: <span class="font-semibold">Market Hours</span></p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Error Messages -->
    <UCard v-if="hasErrors" class="border-red-500 border-2">
      <template #header>
        <h3 class="text-lg font-semibold text-red-600 dark:text-red-400">Connection Errors</h3>
      </template>
      <div class="space-y-2">
        <div v-if="!asterBalance.success" class="text-sm">
          <span class="font-semibold">Aster DEX:</span> {{ asterBalance.error }}
        </div>
        <div v-if="!oandaBalance.success" class="text-sm">
          <span class="font-semibold">OANDA:</span> {{ oandaBalance.error }}
        </div>
        <div v-if="!tradierBalance.success" class="text-sm">
          <span class="font-semibold">Tradier:</span> {{ tradierBalance.error }}
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface ExchangeBalance {
  success: boolean
  exchange?: string
  balance?: number | null
  error?: string
  [key: string]: any
}

// State
const isLoading = ref(false)
const asterBalance = ref<ExchangeBalance>({ success: false })
const oandaBalance = ref<ExchangeBalance>({ success: false })
const tradierBalance = ref<ExchangeBalance>({ success: false })
const lastUpdate = ref('')

// Computed
const totalBalance = computed(() => {
  let total = 0
  if (asterBalance.value.success && asterBalance.value.balance) total += asterBalance.value.balance
  if (oandaBalance.value.success && oandaBalance.value.balance) total += oandaBalance.value.balance
  if (tradierBalance.value.success && tradierBalance.value.balance) total += tradierBalance.value.balance
  return total
})

const hasErrors = computed(() => {
  return !asterBalance.value.success || !oandaBalance.value.success || !tradierBalance.value.success
})

// Load balances from APIs
async function loadBalances() {
  isLoading.value = true
  try {
    // Fetch all balances in parallel
    const [aster, oanda, tradier] = await Promise.all([
      $fetch('/api/balance/aster').catch(e => ({ success: false, error: e.message })),
      $fetch('/api/balance/oanda').catch(e => ({ success: false, error: e.message })),
      $fetch('/api/balance/tradier').catch(e => ({ success: false, error: e.message }))
    ])

    asterBalance.value = aster as ExchangeBalance
    oandaBalance.value = oanda as ExchangeBalance
    tradierBalance.value = tradier as ExchangeBalance

    lastUpdate.value = new Date().toLocaleString()
  } catch (error) {
    console.error('Error loading balances:', error)
  } finally {
    isLoading.value = false
  }
}

// Load on mount and refresh every 30 seconds
onMounted(() => {
  loadBalances()
  setInterval(loadBalances, 30000)
})

definePageMeta({
  title: 'Exchange Accounts',
  description: 'View balances across all trading exchanges'
})
</script> 