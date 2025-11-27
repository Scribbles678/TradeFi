<script lang="ts" setup>
interface TrafficDataItem {
  hour: string
  organic: number
  paid: number
  social: number
  direct: number
}

const TrafficData: TrafficDataItem[] = [
  { hour: '06:00', organic: 120, paid: 45, social: 30, direct: 85 },
  { hour: '09:00', organic: 280, paid: 90, social: 65, direct: 150 },
  { hour: '12:00', organic: 450, paid: 180, social: 120, direct: 220 },
  { hour: '15:00', organic: 380, paid: 165, social: 95, direct: 190 },
  { hour: '18:00', organic: 520, paid: 200, social: 140, direct: 260 },
  { hour: '21:00', organic: 320, paid: 130, social: 80, direct: 170 }
]

const TrafficCategories = computed(() => ({
  organic: {
    name: 'Organic',
    color: '#10b981'
  },
  paid: {
    name: 'Paid',
    color: '#6366f1'
  },
  social: {
    name: 'Social',
    color: '#8b5cf6'
  },
  direct: {
    name: 'Direct',
    color: '#f59e0b'
  }
}))

const xFormatter = (i: number): string => `${TrafficData[i]?.hour}`
const yFormatter = (value: number): string => `${value}`
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle> Traffic Analytics </CardTitle>
      <CardDescription>Last Hours</CardDescription>
    </CardHeader>

    <CardContent>
      <AreaChart
        :data="TrafficData"
        :height="240"
        :categories="TrafficCategories"
        :x-formatter="xFormatter"
        :y-formatter="yFormatter"
        :curve-type="CurveType.Cardinal"
        :legend-position="LegendPosition.BottomCenter"
        :hide-legend="false"
        :x-grid-line="false"
        :y-grid-line="true"
        :x-domain-line="true"
        :y-domain-line="false"
        :x-num-ticks="6"
        :y-num-ticks="3"
      />
    </CardContent>
  </Card>
</template>
