<script lang="ts" setup>
import { useResponsiveHeight } from '~/composables/useResponsiveHeight'

interface RegionalData {
  date: string
  na: number
  eu: number
  apac: number
}

interface Props {
  curveType?: typeof CurveType[keyof typeof CurveType]
}

const { curveType = CurveType.MonotoneX } = defineProps<Props>()

const generateChartData = (): RegionalData[] => {
  const data: RegionalData[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0] ?? '',
      na: Math.floor(Math.random() * (100 - 40 + 1)) + 40,
      eu: Math.floor(Math.random() * (80 - 30 + 1)) + 30,
      apac: Math.floor(Math.random() * (60 - 20 + 1)) + 20
    })
  }
  return data
}

const chartData = ref<RegionalData[]>(generateChartData())

const chartCategories: Record<string, BulletLegendItemInterface> = {
  na: {
    name: 'North America',
    color: '#3b82f6' // blue-500
  },
  eu: {
    name: 'Europe',
    color: '#22c55e' // green-500
  },
  apac: {
    name: 'Asia-Pacific',
    color: '#f97316' // orange-500
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
      :hide-area="true"
      :line-width="3"
    />
  </div>
</template>
