<script lang="ts" setup>
interface AssetClassDataPoint {
  date: string
  crypto?: number
  forex?: number
  stocks?: number
  options?: number
  futures?: number
}

const props = defineProps<{
  chartView: 'pnl' | 'winrate'
}>()

const supabase = useSupabaseClient()
const chartData = ref<AssetClassDataPoint[]>([])
const isLoading = ref(false)

// Chart categories for asset classes
const chartCategories: Record<string, BulletLegendItemInterface> = {
  crypto: {
    name: 'Crypto',
    color: '#10b981' // emerald-500
  },
  forex: {
    name: 'Forex',
    color: '#0ea5e9' // sky-500
  },
  stocks: {
    name: 'Stocks',
    color: '#f59e0b' // amber-500
  },
  options: {
    name: 'Options',
    color: '#8b5cf6' // violet-500
  },
  futures: {
    name: 'Futures',
    color: '#ec4899' // pink-500
  }
}

const yAxisKeys = ['crypto', 'forex', 'stocks', 'options', 'futures']

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

// Load asset class performance data
async function loadAssetClassData() {
  isLoading.value = true
  try {
    // Get trades from last 30 days grouped by asset class and date
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: trades, error } = await supabase
      .from('trades')
      .select('asset_class, exchange, exit_time, pnl_usd, is_winner')
      .gte('exit_time', thirtyDaysAgo.toISOString())
      .order('exit_time', { ascending: true })

    if (error) {
      console.error('Error loading asset class performance data:', error)
      return
    }

    // Process data into daily aggregates per asset class
    const dailyData: Record<string, Record<string, { pnl: number; trades: number; wins: number }>> = {}
    
    trades?.forEach(trade => {
      // Determine asset class from trade
      let assetClass = trade.asset_class
      
      // Fallback to exchange mapping if asset_class is not set
      if (!assetClass || assetClass === 'unknown') {
        const exchangeMapping: Record<string, string> = {
          'oanda': 'forex',
          'aster': 'crypto',
          'tradier': 'stocks',
          'tastytrade': 'futures'
        }
        assetClass = exchangeMapping[trade.exchange] || 'stocks'
      }
      
      const date = new Date(trade.exit_time).toISOString().split('T')[0]
      
      if (!dailyData[date]) dailyData[date] = {}
      if (!dailyData[date][assetClass]) {
        dailyData[date][assetClass] = { pnl: 0, trades: 0, wins: 0 }
      }
      
      if (props.chartView === 'pnl') {
        dailyData[date][assetClass].pnl += trade.pnl_usd || 0
      } else {
        dailyData[date][assetClass].trades += 1
        if (trade.is_winner) dailyData[date][assetClass].wins += 1
      }
    })

    // Convert to chart data format
    const dataPoints: AssetClassDataPoint[] = []
    const sortedDates = Object.keys(dailyData).sort()

    sortedDates.forEach(date => {
      const point: AssetClassDataPoint = { date }
      
      yAxisKeys.forEach(assetClass => {
        if (dailyData[date][assetClass]) {
          if (props.chartView === 'pnl') {
            point[assetClass] = dailyData[date][assetClass].pnl
          } else {
            const { trades, wins } = dailyData[date][assetClass]
            point[assetClass] = trades > 0 ? (wins / trades) * 100 : 0
          }
        } else {
          point[assetClass] = 0
        }
      })
      
      dataPoints.push(point)
    })

    chartData.value = dataPoints

  } catch (error) {
    console.error('Error loading asset class performance:', error)
  } finally {
    isLoading.value = false
  }
}

// Watch for view changes
watch(() => props.chartView, () => {
  loadAssetClassData()
}, { immediate: true })
</script>

<template>
  <div class="w-full">
    <div v-if="isLoading" class="h-[280px] flex items-center justify-center">
      <div class="text-center">
        <div class="animate-pulse text-muted-foreground">Loading chart data...</div>
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

