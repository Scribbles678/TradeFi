<script setup lang="ts">
type RevenueDataItem = {
  month: string
  desktop: number
  mobile: number
}

const RevenueData: RevenueDataItem[] = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
  { month: 'July', desktop: 270, mobile: 200 },
  { month: 'August', desktop: 250, mobile: 150 }
]

const RevenueCategoriesMultple = {
  desktop: { name: 'Desktop', color: 'var(--color-yellow-400)' },
  mobile: { name: 'Mobile', color: 'var(--color-emerald-500)' }
}

const xFormatter = (i: number): string => `${RevenueData[i]?.month}`
const yFormatter = (i: number) => i

const { height } = useResponsiveHeight({
  default: 120,
  sm: 240
})
</script>

<template>
  <BarChart
    :data="RevenueData"
    :height="height"
    :categories="RevenueCategoriesMultple"
    :y-axis="['desktop', 'mobile']"
    :group-padding="0.2"
    :bar-padding="0"
    :x-num-ticks="6"
    :y-num-ticks="4"
    :radius="4"
    :x-formatter="xFormatter"
    :y-formatter="yFormatter"
    :legend-position="LegendPosition.Top"
    :hide-legend="true"
    :y-grid-line="true"
  />
</template>
