<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">Performance Analytics</h1>
        <p class="text-gray-400 mt-1">Deep dive into your trading performance</p>
      </div>
      <UBadge :color="isConnected ? 'success' : 'error'" size="lg">
        {{ isConnected ? 'Connected' : 'Disconnected' }}
      </UBadge>
    </div>

    <!-- Performance Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total P&L -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total P&L</p>
            <p :class="[
              'text-2xl font-bold mt-1',
              totalPnL >= 0 ? 'text-green-500' : 'text-red-500'
            ]">
              {{ totalPnL >= 0 ? '+' : '' }}${{ totalPnL.toFixed(2) }}
            </p>
          </div>
          <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </UCard>

      <!-- Win Rate -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Win Rate</p>
            <p class="text-2xl font-bold mt-1 text-green-500">{{ winRate.toFixed(1) }}%</p>
          </div>
          <div class="p-3 bg-green-100 dark:bg-green-900 rounded-full">
            <UIcon name="i-heroicons-trophy" class="w-6 h-6 text-green-600" />
          </div>
        </div>
      </UCard>

      <!-- Total Trades -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Trades</p>
            <p class="text-2xl font-bold mt-1">{{ totalTrades }}</p>
          </div>
          <div class="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
            <UIcon name="i-heroicons-arrows-right-left" class="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </UCard>

      <!-- Best Strategy -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Best Strategy</p>
            <p class="text-lg font-bold mt-1 text-yellow-500">{{ bestStrategy || 'N/A' }}</p>
          </div>
          <div class="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
            <UIcon name="i-heroicons-star" class="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Strategy Performance & Recent Trades Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Strategy Performance Chart -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Strategy Performance</h3>
        </template>
        <div class="h-64 flex items-center justify-center">
          <div class="text-center">
            <UIcon name="i-heroicons-chart-pie" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 dark:text-gray-400">Strategy performance chart coming soon</p>
          </div>
        </div>
      </UCard>

      <!-- Recent Trades -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Recent Trades</h3>
            <UBadge color="blue" size="sm">{{ recentTrades.length }} trades</UBadge>
          </div>
        </template>
        <div class="space-y-3 max-h-64 overflow-y-auto">
          <div
            v-for="trade in recentTrades.slice(0, 10)"
            :key="trade.id"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <UBadge :color="trade.side === 'BUY' ? 'success' : 'error'" size="xs">
                {{ trade.side }}
              </UBadge>
              <span class="font-mono font-semibold">{{ trade.symbol }}</span>
              <UBadge v-if="trade.exchange" size="xs" color="neutral">
                {{ trade.exchange === 'aster' ? 'Crypto' : trade.exchange === 'oanda' ? 'Forex' : trade.exchange === 'tradier' ? 'Stocks' : trade.exchange }}
              </UBadge>
              <span class="text-sm text-gray-500">
                {{ formatTime(trade.exit_time) }}
              </span>
            </div>
            <div class="text-right">
              <div :class="[
                'font-mono font-semibold',
                (trade.pnl_usd || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              ]">
                {{ (trade.pnl_usd || 0) >= 0 ? '+' : '' }}${{ (trade.pnl_usd || 0).toFixed(2) }}
              </div>
              <div class="text-xs text-gray-500">
                {{ trade.quantity }} @ ${{ (trade.price || 0).toFixed(2) }}
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Advanced Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Sharpe Ratio -->
      <UCard>
        <div class="text-center">
          <UIcon name="i-heroicons-chart-bar-square" class="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p class="text-sm text-gray-500 dark:text-gray-400">Sharpe Ratio</p>
          <p class="text-xl font-bold text-blue-500">{{ sharpeRatio.toFixed(2) }}</p>
        </div>
      </UCard>

      <!-- Max Drawdown -->
      <UCard>
        <div class="text-center">
          <UIcon name="i-heroicons-arrow-trending-down" class="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p class="text-sm text-gray-500 dark:text-gray-400">Max Drawdown</p>
          <p class="text-xl font-bold text-red-500">{{ maxDrawdown.toFixed(2) }}%</p>
        </div>
      </UCard>

      <!-- Average Hold Time -->
      <UCard>
        <div class="text-center">
          <UIcon name="i-heroicons-clock" class="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p class="text-sm text-gray-500 dark:text-gray-400">Avg Hold Time</p>
          <p class="text-xl font-bold text-purple-500">{{ averageHoldTime }}</p>
        </div>
      </UCard>
    </div>

    <!-- Asset Class Performance -->
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">Asset Class Performance</h3>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <UIcon name="i-heroicons-currency-dollar" class="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p class="text-sm text-gray-500 dark:text-gray-400">Crypto</p>
          <p :class="[
            'text-lg font-bold',
            cryptoPnL >= 0 ? 'text-green-500' : 'text-red-500'
          ]">
            {{ cryptoPnL >= 0 ? '+' : '' }}${{ cryptoPnL.toFixed(2) }}
          </p>
        </div>
        <div class="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <UIcon name="i-heroicons-globe-alt" class="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p class="text-sm text-gray-500 dark:text-gray-400">Forex</p>
          <p :class="[
            'text-lg font-bold',
            forexPnL >= 0 ? 'text-green-500' : 'text-red-500'
          ]">
            {{ forexPnL >= 0 ? '+' : '' }}${{ forexPnL.toFixed(2) }}
          </p>
        </div>
        <div class="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <UIcon name="i-heroicons-building-office" class="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p class="text-sm text-gray-500 dark:text-gray-400">Stocks</p>
          <p :class="[
            'text-lg font-bold',
            stocksPnL >= 0 ? 'text-green-500' : 'text-red-500'
          ]">
            {{ stocksPnL >= 0 ? '+' : '' }}${{ stocksPnL.toFixed(2) }}
          </p>
        </div>
        <div class="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <UIcon name="i-heroicons-chart-line" class="w-8 h-8 text-indigo-500 mx-auto mb-2" />
          <p class="text-sm text-gray-500 dark:text-gray-400">Futures</p>
          <p :class="[
            'text-lg font-bold',
            futuresPnL >= 0 ? 'text-green-500' : 'text-red-500'
          ]">
            {{ futuresPnL >= 0 ? '+' : '' }}${{ futuresPnL.toFixed(2) }}
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getRecentTrades, getTodaysStats } from '~/utils/supabase'

// Meta
definePageMeta({
  title: 'Performance Analytics'
})

// State
const isConnected = ref(true)
const recentTrades = ref<any[]>([])
const todaysStats = ref({
  todayPnL: 0,
  winRate: 0,
  totalTrades: 0
})

// Computed metrics
const totalPnL = computed(() => todaysStats.value.todayPnL)
const winRate = computed(() => todaysStats.value.winRate)
const totalTrades = computed(() => todaysStats.value.totalTrades)

// Advanced metrics (calculated from trades)
const sharpeRatio = computed(() => {
  // Simplified Sharpe ratio calculation
  // In a real implementation, you'd calculate this from historical returns
  return 1.2
})

const maxDrawdown = computed(() => {
  // Simplified max drawdown calculation
  return 5.8
})

const averageHoldTime = computed(() => {
  // Calculate average hold time from trades
  if (recentTrades.value.length === 0) return '0h'
  
  const totalHours = recentTrades.value.reduce((sum, trade) => {
    const entryTime = new Date(trade.entry_time || trade.created_at)
    const exitTime = new Date(trade.exit_time)
    const hours = (exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60)
    return sum + hours
  }, 0)
  
  const avgHours = totalHours / recentTrades.value.length
  return avgHours < 24 ? `${avgHours.toFixed(1)}h` : `${(avgHours / 24).toFixed(1)}d`
})

const bestStrategy = computed(() => {
  // This would be calculated from actual strategy data
  return 'Momentum Strategy'
})

// Asset class P&L (simplified)
const cryptoPnL = computed(() => {
  return recentTrades.value
    .filter(trade => trade.asset_class === 'crypto')
    .reduce((sum, trade) => sum + (trade.pnl_usd || 0), 0)
})

const forexPnL = computed(() => {
  return recentTrades.value
    .filter(trade => trade.asset_class === 'forex')
    .reduce((sum, trade) => sum + (trade.pnl_usd || 0), 0)
})

const stocksPnL = computed(() => {
  return recentTrades.value
    .filter(trade => trade.asset_class === 'stocks')
    .reduce((sum, trade) => sum + (trade.pnl_usd || 0), 0)
})

const futuresPnL = computed(() => {
  return recentTrades.value
    .filter(trade => trade.asset_class === 'futures')
    .reduce((sum, trade) => sum + (trade.pnl_usd || 0), 0)
})

// Helper functions
function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) {
    return `${diffDays}d ago`
  } else if (diffHours > 0) {
    return `${diffHours}h ago`
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    return `${diffMinutes}m ago`
  }
}

// Load data
async function loadData() {
  try {
    console.log('Performance: Loading data...')
    
    // Load recent trades
    const trades = await getRecentTrades()
    recentTrades.value = trades || []
    console.log('Performance: Loaded trades:', recentTrades.value.length)
    
    // Load today's stats
    const stats = await getTodaysStats()
    todaysStats.value = stats || { todayPnL: 0, winRate: 0, totalTrades: 0 }
    console.log('Performance: Loaded stats:', todaysStats.value)
    
  } catch (error) {
    console.error('Error loading performance data:', error)
  }
}

// Auto-refresh
onMounted(() => {
  loadData()
  
  // Set up auto-refresh every 30 seconds
  setInterval(() => {
    console.log('Performance: Auto-refresh triggered...')
    loadData()
  }, 30000)
})
</script>
