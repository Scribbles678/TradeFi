<script lang="ts" setup>
const RevenueData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
  { month: 'July', desktop: 190, mobile: 110 },
  { month: 'August', desktop: 220, mobile: 150 },
  { month: 'September', desktop: 175, mobile: 95 },
  { month: 'October', desktop: 260, mobile: 180 },
  { month: 'November', desktop: 230, mobile: 120 },
  { month: 'December', desktop: 250, mobile: 160 }
]

const RevenueCategories = {
  desktop: { name: 'Desktop', color: '#10b981' }
}

const xFormatter = (i: number): string => `${RevenueData[i]?.month}`
const yFormatter = (i: number) => i.toString()
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle> Performance Metrics </CardTitle>
      <CardDescription>Last 6 Months</CardDescription>
    </CardHeader>

    <CardContent>
      <BarChart
        :data="RevenueData"
        :height="240"
        :categories="RevenueCategories"
        :y-axis="['desktop']"
        :x-num-ticks="6"
        :y-num-ticks="4"
        :radius="4"
        :grid-line-y="true"
        :x-formatter="xFormatter"
        :y-formatter="yFormatter"
        :legend-position="LegendPosition.BottomCenter"
      />
    </CardContent>
  </Card>
</template>
