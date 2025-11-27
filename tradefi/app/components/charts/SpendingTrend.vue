<script setup lang="ts">
interface SpendingData {
  month: number
  currentYear: number
  lastYear: number
}

const chartData = ref<SpendingData[]>([
  { month: 1, currentYear: 2500, lastYear: 2000 },
  { month: 2, currentYear: 1500, lastYear: 1200 },
  { month: 3, currentYear: 3000, lastYear: 2800 },
  { month: 4, currentYear: 4000, lastYear: 3500 },
  { month: 5, currentYear: 4500, lastYear: 4200 },
  { month: 6, currentYear: 2800, lastYear: 2500 },
  { month: 7, currentYear: 3500, lastYear: 3100 },
  { month: 8, currentYear: 3800, lastYear: 3600 },
  { month: 9, currentYear: 2000, lastYear: 1800 },
  { month: 10, currentYear: 4200, lastYear: 4000 },
  { month: 11, currentYear: 2200, lastYear: 2100 },
  { month: 12, currentYear: 1800, lastYear: 1600 }
])

const categories: Record<string, any> = {
  currentYear: { name: 'Current Year', color: '#6366f1' },
  lastYear: { name: 'Last Year', color: '#94a3b8' }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Revenue Trend</CardTitle>
      <CardDescription>Year over Year</CardDescription>
    </CardHeader>

    <CardContent>
      <AreaChart
        :data="chartData"
        :height="240"
        :categories="categories"
        :y-axis="['amount']"
        :y-num-ticks="3"
        :y-grid-line="true"
        :curve-type="CurveType.MonotoneX"
        :legend-position="LegendPosition.BottomCenter"
        :x-formatter="
          (i: number) =>
            new Date(`2025-${chartData[i]?.month}-02`).toLocaleDateString(
              'en-US',
              {
                month: 'short'
              }
            )
        "
        :y-formatter="formatCurrency"
      />
    </CardContent>
  </Card>
</template>
