<script lang="ts" setup>
interface SignalDataPoint {
  date: string
  [key: string]: number | string // Dynamic strategy names
}

interface Strategy {
  id: string
  name: string
}

const props = defineProps<{
  strategies: Strategy[]
}>()

const supabase = useSupabaseClient()
const chartData = ref<SignalDataPoint[]>([])
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

const xFormatter = (tick: number): string => {
  const dataPoint = chartData.value[tick]
  if (!dataPoint) return ''
  const date = new Date(dataPoint.date)
  return `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })}`
}

const { height } = useResponsiveHeight({
  default: 120,
  sm: 240
})

// Load signal frequency data by strategy (using trades as proxy for webhook signals)
async function loadSignalData() {
  if (props.strategies.length === 0) {
    chartData.value = []
    return
  }

  isLoading.value = true
  try {
    // Get trades from last 30 days grouped by strategy and date
    // Using trades with strategy_id as a proxy for webhook signals
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: trades, error } = await supabase
      .from('trades')
      .select('strategy_id, entry_time')
      .gte('entry_time', thirtyDaysAgo.toISOString())
      .order('entry_time', { ascending: true })

    if (error) {
      console.error('Error loading signal data:', error)
      return
    }

    // Process data into daily aggregates per strategy
    const dailyData: Record<string, Record<string, number>> = {}
    
    trades?.forEach(trade => {
      if (!trade.strategy_id) return
      
      const date = new Date(trade.entry_time).toISOString().split('T')[0]
      
      if (!dailyData[date]) dailyData[date] = {}
      if (!dailyData[date][trade.strategy_id]) {
        dailyData[date][trade.strategy_id] = 0
      }
      
      dailyData[date][trade.strategy_id] += 1
    })

    // Convert to chart data format
    const dataPoints: SignalDataPoint[] = []
    const sortedDates = Object.keys(dailyData).sort()

    sortedDates.forEach(date => {
      const point: SignalDataPoint = { date }
      props.strategies.forEach(strategy => {
        point[strategy.id] = dailyData[date][strategy.id] || 0
      })
      dataPoints.push(point)
    })

    chartData.value = dataPoints

  } catch (error) {
    console.error('Error loading signal data:', error)
  } finally {
    isLoading.value = false
  }
}

// Watch for strategy changes
watch(() => props.strategies, () => {
  loadSignalData()
}, { immediate: true, deep: true })
</script>

<template>
  <div class="w-full">
    <div v-if="isLoading" class="h-[240px] flex items-center justify-center">
      <div class="text-center">
        <div class="animate-pulse text-muted-foreground">Loading chart data...</div>
      </div>
    </div>
    <div v-else-if="strategies.length === 0" class="h-[240px] flex items-center justify-center">
      <div class="text-center">
        <Icon name="i-heroicons-chart-bar" class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p class="text-muted-foreground">No active strategies</p>
      </div>
    </div>
    <div v-else-if="chartData.length === 0" class="h-[240px] flex items-center justify-center">
      <div class="text-center">
        <Icon name="i-heroicons-chart-bar" class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p class="text-muted-foreground">No signal data in the last 30 days</p>
      </div>
    </div>
    <div v-else class="pt-2">
      <BarChart
        :data="chartData"
        :height="height"
        :x-num-ticks="6"
        :y-num-ticks="5"
        :categories="chartCategories"
        :x-formatter="xFormatter"
        :grid-line-y="true"
        :radius="20"
        :bar-padding="0.35"
        :y-axis="yAxisKeys"
        :legend-position="LegendPosition.BottomCenter"
      />
    </div>
  </div>
</template>

