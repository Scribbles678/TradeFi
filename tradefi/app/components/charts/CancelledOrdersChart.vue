<script lang="ts" setup>
import { useResponsiveHeight } from '~/composables/useResponsiveHeight'

interface CancelledData {
  date: string
  cancelled: number
}

interface Props {
  curveType?: typeof CurveType[keyof typeof CurveType]
}

const { curveType = CurveType.MonotoneX } = defineProps<Props>()

const generateChartData = (): CancelledData[] => {
  const data: CancelledData[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0] ?? '',
      cancelled: Math.floor(Math.random() * (15 - 2 + 1)) + 2
    })
  }
  return data
}

const chartData = ref<CancelledData[]>(generateChartData())

const chartCategories: Record<string, BulletLegendItemInterface> = {
  cancelled: {
    name: 'Cancelled Orders',
    color: '#ef4444' // red-500
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
      :radius="6"
      :curve-type="curveType"
      :y-num-ticks="5"
      :line-width="2"
      :dash-array="[4, 4]"
      :gradient-stops="[
        { offset: 0, color: '#ef4444', stopOpacity: 0.3 },
        { offset: 100, color: '#ef4444', stopOpacity: 0 }
      ]"
    />
  </div>
</template>
