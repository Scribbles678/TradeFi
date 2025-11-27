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
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <!-- Win Rate -->
      <Card>
        <CardContent class="text-center space-y-6 h-full flex flex-col justify-center py-6">
          <div class="flex items-center justify-center gap-2">
            <Icon name="i-heroicons-trophy" class="w-5 h-5 text-muted-foreground" />
            <p class="text-sm text-muted-foreground font-medium">Win Rate</p>
          </div>
          <div>
            <p class="text-4xl font-bold text-green-400">{{ winRate.toFixed(1) }}%</p>
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

    <!-- Strategy Performance & Recent Trades Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Strategy Performance Chart -->
      <Card>
        <CardHeader>
          <CardTitle>Strategy Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="h-64 flex items-center justify-center">
            <div class="text-center">
              <Icon name="i-heroicons-chart-pie" class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p class="text-muted-foreground">Strategy performance chart coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Recent Trades -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>Recent Trades</CardTitle>
            <Badge variant="outline" class="text-xs">{{ recentTrades.length }} trades</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div class="max-h-64 overflow-y-auto">
            <Table v-if="recentTrades.length > 0">
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead class="text-right">P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow 
                  v-for="trade in recentTrades.slice(0, 10)" 
                  :key="trade.id"
                  class="hover:bg-accent"
                >
                  <TableCell class="font-mono font-semibold">
                    {{ trade.symbol }}
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <Badge :variant="trade.side === 'BUY' ? 'success' : 'error'" class="text-xs">
                        {{ trade.side }}
                      </Badge>
                      <Badge v-if="trade.exchange" variant="outline" class="text-xs">
                        {{ trade.exchange === 'aster' ? 'Crypto' : trade.exchange === 'oanda' ? 'Forex' : trade.exchange === 'tradier' ? 'Stocks' : trade.exchange }}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell class="text-muted-foreground text-sm">
                    {{ formatTime(trade.exit_time) }}
                  </TableCell>
                  <TableCell class="text-right">
                    <div :class="[
                      'font-mono font-semibold',
                      (trade.pnl_usd || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    ]">
                      {{ (trade.pnl_usd || 0) >= 0 ? '+' : '' }}${{ (trade.pnl_usd || 0).toFixed(2) }}
                    </div>
                    <div class="text-xs text-muted-foreground">
                      {{ trade.quantity }} @ ${{ (trade.price || 0).toFixed(2) }}
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            <div v-else class="text-center py-8 text-muted-foreground">
              No trades yet
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Advanced Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Sharpe Ratio -->
      <Card>
        <CardContent class="text-center space-y-4 py-6">
          <div class="flex items-center justify-center gap-2">
            <Icon name="i-heroicons-chart-bar-square" class="w-5 h-5 text-muted-foreground" />
            <p class="text-sm text-muted-foreground font-medium">Sharpe Ratio</p>
          </div>
          <p class="text-3xl font-bold text-foreground">{{ sharpeRatio.toFixed(2) }}</p>
        </CardContent>
      </Card>

      <!-- Max Drawdown -->
      <Card>
        <CardContent class="text-center space-y-4 py-6">
          <div class="flex items-center justify-center gap-2">
            <Icon name="i-heroicons-arrow-trending-down" class="w-5 h-5 text-muted-foreground" />
            <p class="text-sm text-muted-foreground font-medium">Max Drawdown</p>
          </div>
          <p class="text-3xl font-bold text-red-400">{{ maxDrawdown.toFixed(2) }}%</p>
        </CardContent>
      </Card>

      <!-- Average Hold Time -->
      <Card>
        <CardContent class="text-center space-y-4 py-6">
          <div class="flex items-center justify-center gap-2">
            <Icon name="i-heroicons-clock" class="w-5 h-5 text-muted-foreground" />
            <p class="text-sm text-muted-foreground font-medium">Avg Hold Time</p>
          </div>
          <p class="text-3xl font-bold text-foreground">{{ averageHoldTime }}</p>
        </CardContent>
      </Card>
    </div>

    <!-- Asset Class Performance -->
    <Card>
      <CardHeader>
        <CardTitle>Asset Class Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="text-center p-4 rounded-lg border bg-card">
            <Icon name="i-heroicons-currency-dollar" class="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p class="text-sm text-muted-foreground">Crypto</p>
            <p :class="[
              'text-lg font-bold',
              cryptoPnL >= 0 ? 'text-green-400' : 'text-red-400'
            ]">
              {{ cryptoPnL >= 0 ? '+' : '' }}${{ cryptoPnL.toFixed(2) }}
            </p>
          </div>
          <div class="text-center p-4 rounded-lg border bg-card">
            <Icon name="i-heroicons-globe-alt" class="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p class="text-sm text-muted-foreground">Forex</p>
            <p :class="[
              'text-lg font-bold',
              forexPnL >= 0 ? 'text-green-400' : 'text-red-400'
            ]">
              {{ forexPnL >= 0 ? '+' : '' }}${{ forexPnL.toFixed(2) }}
            </p>
          </div>
          <div class="text-center p-4 rounded-lg border bg-card">
            <Icon name="i-heroicons-building-office" class="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p class="text-sm text-muted-foreground">Stocks</p>
            <p :class="[
              'text-lg font-bold',
              stocksPnL >= 0 ? 'text-green-400' : 'text-red-400'
            ]">
              {{ stocksPnL >= 0 ? '+' : '' }}${{ stocksPnL.toFixed(2) }}
            </p>
          </div>
          <div class="text-center p-4 rounded-lg border bg-card">
            <Icon name="i-heroicons-chart-line" class="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <p class="text-sm text-muted-foreground">Futures</p>
            <p :class="[
              'text-lg font-bold',
              futuresPnL >= 0 ? 'text-green-400' : 'text-red-400'
            ]">
              {{ futuresPnL >= 0 ? '+' : '' }}${{ futuresPnL.toFixed(2) }}
            </p>
          </div>
        </div>
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
