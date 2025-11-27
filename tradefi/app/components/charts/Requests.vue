<script setup lang="ts">
// Generate time-series data for requests
const timeLabels = Array.from({ length: 96 }, (_, i) => i)

// Generate realistic requests pattern with variation
function generateRequestsData() {
  return timeLabels.map((_, i) => {
    const baseValue = 45 + Math.sin(i / 8) * 15
    const noise = Math.random() * 8
    return Math.max(20, Math.min(80, baseValue + noise))
  })
}

const requestsData = generateRequestsData()

const chartData = timeLabels.map((_, i) => ({
  time: i,
  requests: Math.floor(requestsData[i])
}))

const categories = {
  requests: { name: 'Total Requests', color: '#00a63e' }
}
</script>

<template>
  <BarChart
    :height="300"
    :data="chartData"
    :categories="categories"
    :show-legend="true"
    :show-x-axis="false"
    :show-y-axis="false"
    :show-grid-line="false"
    :show-tooltip="true"
    :group-padding="0.5"
    :radius="2"
    :bar-padding="0.2"
    :y-axis="['requests']"
  />
</template>
