<script lang="ts" setup>
const colorMode = useColorMode()

interface MetricDataItem {
  time: string
  cpu: number
}

const MetricData: MetricDataItem[] = [
  { time: '00:00', cpu: 45 },
  { time: '02:00', cpu: 38 },
  { time: '04:00', cpu: 52 },
  { time: '06:00', cpu: 47 },
  { time: '08:00', cpu: 78 },
  { time: '10:00', cpu: 71 },
  { time: '12:00', cpu: 65 },
  { time: '14:00', cpu: 73 },
  { time: '16:00', cpu: 82 },
  { time: '18:00', cpu: 68 },
  { time: '20:00', cpu: 58 },
  { time: '22:00', cpu: 43 },
  { time: '24:00', cpu: 41 }
]

const MetricCategories = computed(() => ({
  cpu: {
    name: 'CPU Usage',
    color: colorMode.value === 'dark' ? '#f97316' : '#ea580c'
  }
}))

const xFormatter = (i: number): string => `${MetricData[i]?.time}`
const yFormatter = (value: number): string => `${value}%`
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>
        System Performance
      </CardTitle>
      <CardDescription>
        Last 24 hours
      </CardDescription>
    </CardHeader>
    <CardContent>
      <LineChart
        :key="colorMode.value"
        :data="MetricData"
        :height="240"
        :categories="MetricCategories"
        :x-formatter="xFormatter"
        :y-formatter="yFormatter"
        :curve-type="CurveType.Step"
        :legend-position="LegendPosition.BottomCenter"
        :hide-legend="false"
        :x-grid-line="true"
        :y-grid-line="true"
        :x-domain-line="false"
        :y-domain-line="false"
        :hide-tooltip="false"
        :y-num-ticks="5"
        :x-num-ticks="6"
      />
    </CardContent>
  </Card>
</template>
