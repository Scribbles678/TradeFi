<script lang="ts" setup>
import { Settings } from 'lucide-vue-next'

import {
  getDailyWebsiteStatistics,
  getWeeklyWebsiteStatistics,
  getMonthlyWebsiteStatistics
} from '~/data/WebsiteStatistics'

defineProps<{
  categories: Record<string, BulletLegendItemInterface>
}>()

const isSettingsOpen = ref<boolean>(false)

function toggleSettings() {
  isSettingsOpen.value = !isSettingsOpen.value
}

const selectedDataView = ref('daily')

const WebsiteStatistics = computed(() => {
  switch (selectedDataView.value) {
    case 'weekly':
      return getWeeklyWebsiteStatistics.value
    case 'monthly':
      return getMonthlyWebsiteStatistics.value
    case 'daily':
    default:
      return getDailyWebsiteStatistics.value
  }
})

const xFormatter = (i: number): string =>
  String(WebsiteStatistics.value[i]?.date ?? '')
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <div>
          <CardTitle>Web Performance</CardTitle>
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
        <AreaChart
          :data="WebsiteStatistics"
          :height="240"
          :x-num-ticks="6"
          :y-num-ticks="5"
          :categories="categories"
          :x-formatter="xFormatter"
          :grid-line-y="true"
          :legend-position="LegendPosition.BottomCenter"
          :curve-type="CurveType.MonotoneX"
        />
      </div>
    </CardContent>
  </Card>
</template>
