<script setup lang="ts">
const hours = [
  '2 AM',
  '3 AM',
  '4 AM',
  '5 AM',
  '6 AM',
  '7 AM',
  '8 AM',
  '9 AM',
  '10 AM',
  '11 AM',
  '12 PM',
  '1 PM',
  '2 PM',
  '3 PM',
  '4 PM',
  '5 PM',
  '6 PM',
  '7 PM',
  '8 PM',
  '9 PM',
  '10 PM'
]

function randomData() {
  return Array.from(
    { length: hours.length },
    () => Math.floor(Math.random() * 50) + 40
  )
}

const chartData = hours.map((hour, i) => ({
  hour,
  image_1: randomData()[i],
  image_2: randomData()[i],
  image_3: randomData()[i]
}))

const categories = {
  image_1: { name: 'image_1', color: '#6c63ff' },
  image_2: { name: 'image_2', color: '#c471ed' },
  image_3: { name: 'image_3', color: '#12c2e9' }
}

const xFormatter = (tick: number) => hours[tick] ?? ''
</script>

<template>
  <div>
    <LineChart
      :data="chartData"
      :x-num-ticks="6"
      :y-num-ticks="3"
      :categories="categories"
      :x-formatter="xFormatter"
      :curve-type="CurveType.Linear"
      :legend-position="LegendPosition.BottomCenter"
      :y-grid-line="true"
      :y-tick-format="(v: number) => `${v}%`"
    />
  </div>
</template>
