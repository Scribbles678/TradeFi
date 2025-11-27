<script lang="ts" setup>
import { useResponsiveHeight } from '~/composables/useResponsiveHeight'

interface AOVData {
  date: string
  aov: number
}

interface Props {
  curveType?: typeof CurveType[keyof typeof CurveType]
}

const { curveType = CurveType.MonotoneX } = defineProps<Props>()

const generateChartData = (): AOVData[] => {
  const data: AOVData[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0] ?? '',
      aov: Math.floor(Math.random() * (150 - 50 + 1)) + 50
    })
  }
  return data
}

const chartData = ref<AOVData[]>(generateChartData())

const chartCategories: Record<string, BulletLegendItemInterface> = {
  aov: {
    name: 'Average Order Value',
    color: '#8b5cf6' // violet-500
  }
}

const xAxisFormatter = (tick: number): string => {
  const dataPoint = chartData.value[tick]
  if (!dataPoint) return ''

  const date = new Date(dataPoint.date)
  return `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })}`
}

const yAxisFormatter = (value: number): string => {
  return `$${value.toFixed(2)}`
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
      :radius="0"
      :curve-type="curveType"
      :y-num-ticks="4"
      :gradient-stops="[
        { offset: 0, color: '#8b5cf6', stopOpacity: 0.5 },
        { offset: 100, color: '#8b5cf6', stopOpacity: 0.1 }
      ]"
    />
  </div>
</template>
