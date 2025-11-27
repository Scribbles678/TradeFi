<script lang="ts" setup>
const RevenueData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 }
]
const RevenueCategoriesMultple = {
  desktop: { name: 'Desktop', color: '#6366f1' },
  mobile: { name: 'Mobile', color: '#10b981' }
}

const yFormatter = (i: number): string => `${i}`
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle> Traffic Analytics </CardTitle>
      <CardDescription>Per Month</CardDescription>
    </CardHeader>
    <CardContent>
      <BarChart
        :data="RevenueData"
        :stacked="true"
        :height="200"
        :categories="RevenueCategoriesMultple"
        :y-axis="['desktop', 'mobile']"
        :group-padding="0"
        :bar-padding="0.2"
        :x-num-ticks="6"
        :radius="4"
        :orientation="Orientation.Horizontal"
        :x-formatter="yFormatter"
        :y-formatter="(i: number): string => `${RevenueData[i]?.month}`"
        :legend-position="LegendPosition.BottomCenter"
        :hide-legend="false"
        :x-grid-line="true"
      />
    </CardContent>
  </Card>
</template>
