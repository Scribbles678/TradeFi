<template>
  <div class="space-y-8 p-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-semibold text-foreground">Performance Analytics</h1>
        <p class="text-muted-foreground text-sm mt-1">Deep dive into your trading performance</p>
      </div>
      <Badge :variant="isConnected ? 'success' : 'error'" class="text-sm px-3 py-1">
        {{ isConnected ? 'Connected' : 'Disconnected' }}
      </Badge>
    </div>

    <!-- Performance Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Total P&L -->
      <Card>
        <CardContent class="text-center space-y-6 h-full flex flex-col justify-center py-6">
          <div class="flex items-center justify-center gap-2">
            <Icon name="i-heroicons-chart-bar" class="w-5 h-5 text-muted-foreground" />
            <p class="text-sm text-muted-foreground font-medium">Total P&L</p>
          </div>
          <div>
            <p :class="[
              'text-4xl font-bold',
              totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
            ]">
              {{ totalPnL >= 0 ? '+' : '' }}${{ totalPnL.toFixed(2) }}
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Total Trades -->
      <Card>
        <CardContent class="text-center space-y-6 h-full flex flex-col justify-center py-6">
          <div class="flex items-center justify-center gap-2">
            <Icon name="i-heroicons-arrows-right-left" class="w-5 h-5 text-muted-foreground" />
            <p class="text-sm text-muted-foreground font-medium">Total Trades</p>
          </div>
          <div>
            <p class="text-4xl font-bold text-foreground">{{ totalTrades }}</p>
          </div>
        </CardContent>
      </Card>

      <!-- Best Strategy -->
      <Card>
        <CardContent class="text-center space-y-6 h-full flex flex-col justify-center py-6">
          <div class="flex items-center justify-center gap-2">
            <Icon name="i-heroicons-star" class="w-5 h-5 text-muted-foreground" />
            <p class="text-sm text-muted-foreground font-medium">Best Strategy</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ bestStrategy || 'N/A' }}</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Win Rate by Strategy Chart - Full Width -->
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Win Rate by Strategy</CardTitle>
          <CardDescription>Last 30 Days</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ChartsWinRateByStrategy :strategies="activeStrategies" />
      </CardContent>
    </Card>

    <!-- Strategy Performance Chart - Full Width -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Strategy Performance</CardTitle>
          <div class="flex gap-2">
            <Button
              size="sm"
              :variant="chartView === 'pnl' ? 'default' : 'outline'"
              @click="chartView = 'pnl'"
            >
              P&L
            </Button>
            <Button
              size="sm"
              :variant="chartView === 'winrate' ? 'default' : 'outline'"
              @click="chartView = 'winrate'"
            >
              Win Rate
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartsStrategyPerformance :strategies="activeStrategies" :chart-view="chartView" />
      </CardContent>
    </Card>

    <!-- Signals by Strategy Chart - Full Width -->
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Signals</CardTitle>
          <CardDescription>Webhook Signal Frequency by Strategy - Last 30 Days</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ChartsSignalsByStrategy :strategies="activeStrategies" />
      </CardContent>
    </Card>

    <!-- Asset Class Performance -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Asset Class Performance</CardTitle>
          <div class="flex gap-2">
            <Button
              size="sm"
              :variant="assetChartView === 'pnl' ? 'default' : 'outline'"
              @click="assetChartView = 'pnl'"
            >
              P&L
            </Button>
            <Button
              size="sm"
              :variant="assetChartView === 'winrate' ? 'default' : 'outline'"
              @click="assetChartView = 'winrate'"
            >
              Win Rate
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartsAssetClassPerformance :chart-view="assetChartView" />
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getRecentTrades, getTodaysStats } from '~/utils/supabase'

// Meta
definePageMeta({
  title: 'Performance Analytics'
})

// Types
type AssetClass = 'forex' | 'crypto' | 'stocks' | 'options' | 'futures'

// Asset Class Options
const assetClasses = [
  { label: 'All', value: 'all' as const },
  { label: 'Forex', value: 'forex' as const },
  { label: 'Crypto', value: 'crypto' as const },
  { label: 'Stocks', value: 'stocks' as const },
  { label: 'Options', value: 'options' as const },
  { label: 'Futures', value: 'futures' as const }
]

// State
const isConnected = ref(true)
const selectedAssetClass = ref<'all' | AssetClass>('all')
const allTrades = ref<any[]>([])
const todaysStats = ref({
  todayPnL: 0,
  winRate: 0,
  totalTrades: 0
})
const chartView = ref<'pnl' | 'winrate'>('pnl')
const assetChartView = ref<'pnl' | 'winrate'>('pnl')
const activeStrategies = ref<any[]>([])

// Filtered trades based on selected asset class
const recentTrades = computed(() => {
  if (selectedAssetClass.value === 'all') {
    return allTrades.value
  }
  return allTrades.value.filter(trade => {
    // Match by asset_class
    if (trade.asset_class === selectedAssetClass.value) {
      return true
    }
    // Fallback to exchange mapping
    const exchangeMapping: Record<string, string> = {
      'forex': 'oanda',
      'crypto': 'aster',
      'stocks': 'tradier',
      'options': 'tradier',
      'futures': 'tastytrade'
    }
    const expectedExchange = exchangeMapping[selectedAssetClass.value]
    return trade.exchange === expectedExchange
  })
})

// Computed metrics
const totalPnL = computed(() => todaysStats.value.todayPnL)
const winRate = computed(() => todaysStats.value.winRate)
const totalTrades = computed(() => todaysStats.value.totalTrades)

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
// Select asset class filter
function selectAssetClass(assetClass: 'all' | AssetClass) {
  selectedAssetClass.value = assetClass
}

// Load active strategies
async function loadStrategies() {
  try {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase
      .from('strategies')
      .select('id, name')
      .eq('status', 'active')
      .order('name')
    
    if (error) {
      console.error('Error loading strategies:', error)
      return
    }
    
    activeStrategies.value = data || []
  } catch (error) {
    console.error('Error loading strategies:', error)
  }
}

async function loadData() {
  try {
    // Load recent trades into allTrades (filtering done by computed)
    const trades = await getRecentTrades()
    allTrades.value = trades || []
    
    // Load today's stats
    const stats = await getTodaysStats()
    todaysStats.value = stats || { todayPnL: 0, winRate: 0, totalTrades: 0 }
    
    // Load active strategies for chart
    await loadStrategies()
    
  } catch (error) {
    console.error('Error loading performance data:', error)
  }
}

// Auto-refresh
onMounted(() => {
  loadData()
  
  // Set up auto-refresh every 30 seconds
  setInterval(() => {
    loadData()
  }, 30000)
})
</script>
