<script lang="ts" setup>
interface CustomerData {
  date: string
  new: number
  returning: number
}

const chartData = ref<CustomerData[]>([
  { date: '2025-10-16', new: 32, returning: 58 },
  { date: '2025-10-17', new: 45, returning: 62 },
  { date: '2025-10-18', new: 28, returning: 74 },
  { date: '2025-10-19', new: 39, returning: 65 },
  { date: '2025-10-20', new: 51, returning: 80 },
  { date: '2025-10-21', new: 36, returning: 59 },
  { date: '2025-10-22', new: 42, returning: 70 },
  { date: '2025-10-23', new: 30, returning: 55 },
  { date: '2025-10-24', new: 47, returning: 68 },
  { date: '2025-10-25', new: 34, returning: 77 },
  { date: '2025-10-26', new: 40, returning: 63 },
  { date: '2025-10-27', new: 29, returning: 72 },
  { date: '2025-10-28', new: 38, returning: 60 },
  { date: '2025-10-29', new: 50, returning: 81 },
  { date: '2025-10-30', new: 37, returning: 66 },
  { date: '2025-10-31', new: 44, returning: 75 },
  { date: '2025-11-01', new: 33, returning: 57 },
  { date: '2025-11-02', new: 46, returning: 69 },
  { date: '2025-11-03', new: 31, returning: 54 },
  { date: '2025-11-04', new: 48, returning: 67 },
  { date: '2025-11-05', new: 35, returning: 76 },
  { date: '2025-11-06', new: 41, returning: 61 },
  { date: '2025-11-07', new: 27, returning: 73 },
  { date: '2025-11-08', new: 49, returning: 79 },
  { date: '2025-11-09', new: 36, returning: 64 },
  { date: '2025-11-10', new: 43, returning: 78 },
  { date: '2025-11-11', new: 30, returning: 56 },
  { date: '2025-11-12', new: 39, returning: 71 },
  { date: '2025-11-13', new: 52, returning: 82 }
])

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

const { height } = useResponsiveHeight({
  default: 120,
  sm: 240
})
</script>

<template>
  <div class="w-[calc(100%-4px)]">
    <LineChart
      :data="chartData"
      :categories="chartCategories"
      :y-axis="['new', 'returning']"
      :x-formatter="xAxisFormatter"
      :height="height"
      :stacked="false"
      :radius="3"
      :group-padding="0.2"
      :bar-padding="0.2"
      :x-grid-line="true"
      :y-grid-line="true"
      :y-num-ticks="4"
    />
  </div>
</template>
