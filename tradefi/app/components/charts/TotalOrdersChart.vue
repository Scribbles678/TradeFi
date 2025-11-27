<script lang="ts" setup>
import { useResponsiveHeight } from '~/composables/useResponsiveHeight'

interface OrderData {
  date: string
  orders: number
}

interface Props {
  curveType?: typeof CurveType[keyof typeof CurveType]
}

const { curveType = CurveType.MonotoneX } = defineProps<Props>()

const generateChartData = (): OrderData[] => {
  const data: OrderData[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0] ?? '',
      orders: Math.floor(Math.random() * (200 - 50 + 1)) + 50
    })
  }
  return data
}

const chartData = ref<OrderData[]>(generateChartData())

const chartCategories: Record<string, BulletLegendItemInterface> = {
  orders: {
    name: 'Total Orders',
    color: '#3b82f6' // blue-500
  }
}

const xAxisFormatter = (tick: number): string => {
  const dataPoint = chartData.value[tick]
  if (!dataPoint) return ''

  const date = new Date(dataPoint.date)
  return `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })}`
}

const yAxisFormatter = (value: number): string => {
  return `${value}`
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
      :curve-type="curveType"
      :y-num-ticks="5"
      :gradient-stops="[
        { offset: 0, color: '#3b82f6', stopOpacity: 0.4 },
        { offset: 100, color: '#3b82f6', stopOpacity: 0 }
      ]"
    />
  </div>
</template>
