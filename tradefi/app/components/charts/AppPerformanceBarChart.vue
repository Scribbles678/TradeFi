<script lang="ts" setup>
import { Settings } from 'lucide-vue-next'

import {
  getDailyPerformanceData,
  getWeeklyPerformanceData,
  getMonthlyPerformanceData
} from '~/data/AppPerformance'

defineProps<{
  categories: Record<string, BulletLegendItemInterface>
}>()

const isSettingsOpen = ref<boolean>(false)

function toggleSettings() {
  isSettingsOpen.value = !isSettingsOpen.value
}

const selectedDataView = ref('daily')

const performanceData = computed(() => {
  switch (selectedDataView.value) {
    case 'weekly':
      return getWeeklyPerformanceData.value
    case 'monthly':
      return getMonthlyPerformanceData.value
    case 'daily':
    default:
      return getDailyPerformanceData.value
  }
})

const xFormatter = (i: number): string =>
  String(performanceData.value[i]?.date ?? '')
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <div>
          <CardTitle>App Performance</CardTitle>
          <CardDescription>Last 6 Months</CardDescription>
        </div>
        <Button
          variant="secondary"
          @click="toggleSettings"
        >
          <Settings class="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>

    <CardContent>
      <div
        v-if="isSettingsOpen"
        class="h-[304px] p-4"
      >
        <div class="w-full space-y-4" />
      </div>

      <div
        v-if="!isSettingsOpen"
        class="pt-2"
      >
        <BarChart
          :data="performanceData"
          :height="240"
          :x-num-ticks="6"
          :y-num-ticks="5"
          :categories="categories"
          :x-formatter="xFormatter"
          :grid-line-y="true"
          :radius="20"
          :bar-padding="0.35"
          :y-axis="['downloads', 'subscriptions']"
          :legend-position="LegendPosition.BottomCenter"
        />
      </div>
    </CardContent>
  </Card>
</template>
