<script lang="ts" setup>
interface StrategyDataPoint {
  date: string
  [key: string]: number | string // Dynamic strategy names
}

interface Strategy {
  id: string
  name: string
  color: string
  totalPnL?: number
  winRate?: number
}

const props = defineProps<{
  strategies: Strategy[]
  chartView: 'pnl' | 'winrate'
}>()

const supabase = useSupabaseClient()
const chartData = ref<StrategyDataPoint[]>([])
const isLoading = ref(false)

// Generate chart categories dynamically based on active strategies
const chartCategories = computed(() => {
  const categories: Record<string, BulletLegendItemInterface> = {}
  props.strategies.forEach((strategy, index) => {
    const colors = [
      '#10b981', // emerald-500
      '#0ea5e9', // sky-500
      '#f59e0b', // amber-500
      '#8b5cf6', // violet-500
      '#ec4899', // pink-500
      '#06b6d4', // cyan-500
    ]
    categories[strategy.id] = {
      name: strategy.name,
      color: colors[index % colors.length]
    }
  })
  return categories
})

// Get strategy IDs for y-axis
const yAxisKeys = computed(() => props.strategies.map(s => s.id))

const xAxisFormatter = (tick: number): string => {
  const dataPoint = chartData.value[tick]
  if (!dataPoint) return ''
  const date = new Date(dataPoint.date)
  return `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })}`
}

const { height } = useResponsiveHeight({
  default: 120,
  sm: 280
})

// Load strategy performance data
async function loadStrategyData() {
  if (props.strategies.length === 0) {
    chartData.value = []
    return
  }

  isLoading.value = true
  try {
    // Get trades from last 30 days grouped by strategy and date
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: trades, error } = await supabase
      .from('trades')
      .select('strategy_id, exit_time, pnl_usd, is_winner')
      .gte('exit_time', thirtyDaysAgo.toISOString())
      .order('exit_time', { ascending: true })

    if (error) {
      console.error('Error loading strategy performance data:', error)
      return
    }

    // Process data into daily aggregates per strategy
    const dailyData: Record<string, Record<string, { pnl: number; trades: number; wins: number }>> = {}
    
    trades?.forEach(trade => {
      if (!trade.strategy_id) return
      
      const date = new Date(trade.exit_time).toISOString().split('T')[0]
      
      if (!dailyData[date]) dailyData[date] = {}
      if (!dailyData[date][trade.strategy_id]) {
        dailyData[date][trade.strategy_id] = { pnl: 0, trades: 0, wins: 0 }
      }
      
      if (props.chartView === 'pnl') {
        dailyData[date][trade.strategy_id].pnl += trade.pnl_usd || 0
      } else {
        dailyData[date][trade.strategy_id].trades += 1
        if (trade.is_winner) dailyData[date][trade.strategy_id].wins += 1
      }
    })

    // Convert to chart data format
    const dataPoints: StrategyDataPoint[] = []
    const sortedDates = Object.keys(dailyData).sort()

    sortedDates.forEach(date => {
      const point: StrategyDataPoint = { date }
      props.strategies.forEach(strategy => {
        if (dailyData[date][strategy.id]) {
          if (props.chartView === 'pnl') {
            point[strategy.id] = dailyData[date][strategy.id].pnl
          } else {
            const { trades, wins } = dailyData[date][strategy.id]
            point[strategy.id] = trades > 0 ? (wins / trades) * 100 : 0
          }
        } else {
          point[strategy.id] = 0
        }
      })
      dataPoints.push(point)
    })

    chartData.value = dataPoints

  } catch (error) {
    console.error('Error loading strategy performance:', error)
  } finally {
    isLoading.value = false
  }
}

// Watch for strategy or view changes
watch([() => props.strategies, () => props.chartView], () => {
  loadStrategyData()
}, { immediate: true, deep: true })
</script>

<template>
  <div class="w-full">
    <div v-if="isLoading" class="h-[280px] flex items-center justify-center">
      <div class="text-center">
        <div class="animate-pulse text-muted-foreground">Loading chart data...</div>
      </div>
    </div>
    <div v-else-if="strategies.length === 0" class="h-[280px] flex items-center justify-center">
      <div class="text-center">
        <Icon name="i-heroicons-chart-bar" class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p class="text-muted-foreground">No active strategies</p>
      </div>
    </div>
    <div v-else-if="chartData.length === 0" class="h-[280px] flex items-center justify-center">
      <div class="text-center">
        <Icon name="i-heroicons-chart-bar" class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p class="text-muted-foreground">No trade data in the last 30 days</p>
      </div>
    </div>
    <div v-else class="w-[calc(100%-4px)]">
      <AreaChart
        :data="chartData"
        :categories="chartCategories"
        :y-axis="yAxisKeys"
        :x-formatter="xAxisFormatter"
        :height="height"
        :curve-type="'monotone'"
        :x-grid-line="true"
        :y-grid-line="true"
        :y-num-ticks="4"
      />
    </div>
  </div>
</template>

