<script lang="ts" setup>
import { useResponsiveHeight } from '~/composables/useResponsiveHeight'

interface CustomerData {
  date: string
  new: number
  returning: number
}

interface Props {
  curveType?: typeof CurveType[keyof typeof CurveType]
}

const { curveType = CurveType.MonotoneX } = defineProps<Props>()

const generateChartData = (): CustomerData[] => {
  const data: CustomerData[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const newCustomers = Math.floor(Math.random() * (80 - 20 + 1)) + 20
    const returningCustomers = Math.floor(Math.random() * (120 - 40 + 1)) + 40
    data.push({
      date: date.toISOString().split('T')[0] ?? '',
      new: newCustomers,
      returning: returningCustomers
    })
  }
  return data
}

const chartData = ref<CustomerData[]>(generateChartData())

const chartCategories: Record<string, BulletLegendItemInterface> = {
  new: {
    name: 'New Customers',
    color: '#10b981' // emerald-500
  },
  returning: {
    name: 'Returning Customers',
    color: '#0ea5e9' // sky-500
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
      :radius="2"
      :curve-type="curveType"
      :y-num-ticks="5"
    />
  </div>
</template>
