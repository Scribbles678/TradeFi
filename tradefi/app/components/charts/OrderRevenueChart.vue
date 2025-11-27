<script lang="ts" setup>
import { useResponsiveHeight } from '~/composables/useResponsiveHeight'

interface RevenueData {
  date: string
  revenue: number
}

interface Props {
  curveType?: typeof CurveType[keyof typeof CurveType]
}

const { curveType = CurveType.MonotoneX } = defineProps<Props>()

const generateChartData = (): RevenueData[] => {
  const data: RevenueData[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0] ?? '',
      revenue: Math.floor(Math.random() * (10000 - 2000 + 1)) + 2000
    })
  }
  return data
}

const chartData = ref<RevenueData[]>(generateChartData())

const chartCategories: Record<string, BulletLegendItemInterface> = {
  revenue: {
    name: 'Total Revenue',
    color: '#22c55e' // green-500
  }
}

const xAxisFormatter = (tick: number): string => {
  const dataPoint = chartData.value[tick]
  if (!dataPoint) return ''

  const date = new Date(dataPoint.date)
  return `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })}`
}

const yAxisFormatter = (value: number): string => {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`
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
      :radius="4"
      :curve-type="curveType"
      :y-num-ticks="6"
      :gradient-stops="[
        { offset: 0, color: '#22c55e', stopOpacity: 0.3 },
        { offset: 100, color: '#22c55e', stopOpacity: 0 }
      ]"
    />
  </div>
</template>
