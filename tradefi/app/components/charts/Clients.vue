<script lang="ts" setup>
interface DailyData {
  date: string
  value: number
}

// Generate data for Oct 18 - Nov 18, 2025
const generateChartData = (): DailyData[] => {
  const data: DailyData[] = []
  const startDate = new Date('2025-10-18')
  // Generate values for each day, following the fluctuations of the first line
  // Extend baseValues to cover 64 days by repeating or interpolating
  const baseValues = []
  const originalValues = [
    1500, 3000, 2500, 2500, 8000, 6000, 3800, 4500,
    5500, 7000, 7500, 6200, 4800, 3200, 5100, 6300,
    7500, 8800, 9700, 10500, 9000, 9800, 7800, 9000,
    10200, 11500, 12400, 13200, 14000, 14500, 15000, 15500
  ]
  for (let i = 0; i < 64; i++) {
    // Repeat the pattern for simplicity
    baseValues.push(originalValues[i % originalValues.length])
  }
  // Create similar fluctuation for other lines (e.g., add small random variation)
  const values = baseValues.map((v, i) => {
    // Simulate similar fluctuation with ±5% random noise
    const noise = v * (Math.random() * 0.1 - 0.05)
    return Math.round(v + noise)
  })

  for (let i = 0; i < 64; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const dateString = date.toISOString().split('T')[0]
    data.push({
      date: dateString || '',
      value: values[i] || 5000
    })
  }

  return data
}

const chartData = ref<DailyData[]>(generateChartData())

const chartCategories: Record<string, BulletLegendItemInterface> = {
  value: {
    name: 'Value',
    color: '#6366f1' // indigo/purple color
  }
}

const xAxisFormatter = (tick: number): string => {
  const dataPoint = chartData.value[tick]
  if (!dataPoint) return ''

  const date = new Date(dataPoint.date)
  return `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })}, ${date.getFullYear()}`
}

const yAxisFormatter = (value: number): string => {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`
  }
  return `$${value}`
}

const { height } = useResponsiveHeight({
  default: 200,
  sm: 280
})
</script>

<template>
  <div>
    <AreaChart
      :data="chartData"
      :categories="chartCategories"
      :x-formatter="xAxisFormatter"
      :y-formatter="yAxisFormatter"
      :height="height"
      :radius="8"
      :curve-type="CurveType.Linear"
      :y-num-ticks="5"
      :gradient-stops="[
        { offset: 0, color: '#6366f1', stopOpacity: 0.4 },
        { offset: 100, color: '#6366f1', stopOpacity: 0 }
      ]"
    />
  </div>
</template>
