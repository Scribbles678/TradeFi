<script lang="ts" setup>
import { ChevronRight } from 'lucide-vue-next'

const marketShareLabels = [
  { name: 'Chrome', percentage: 65.2 },
  { name: 'Safari', percentage: 18.7 },
  { name: 'Edge', percentage: 4.3 },
  { name: 'Firefox', percentage: 3.2 }
]

const marketShareCategories = {
  chrome: {
    name: 'Chrome',
    color: 'var(--color-indigo-500)'
  },
  safari: {
    name: 'Safari',
    color: 'var(--color-emerald-400)'
  },
  edge: {
    name: 'Edge',
    color: 'var(--color-sky-400)'
  },
  firefox: {
    name: 'Firefox',
    color: 'var(--color-orange-400)'
  }
}

type CategoryKey = 'chrome' | 'safari' | 'edge' | 'firefox'

const nameToCategoryKey = (name: string): CategoryKey => {
  const key = name.toLowerCase() as CategoryKey
  return key in marketShareCategories ? key : 'chrome'
}

const marketShareData = marketShareLabels.map(i => i.percentage)
</script>

<template>
  <div class="flex items-center gap-2">
    <DonutChart
      :data="marketShareData"
      :height="230"
      :type="DonutType.Full"
      :radius="4"
      :pad-angle="0.05"
      :arc-width="30"

      :categories="marketShareCategories"
      :hide-legend="true"
    >
      <div>
        <div class="text-foreground">
          Browser
        </div>
      </div>
    </DonutChart>

    <div class="w-full space-y-4">
      <div
        v-for="share in marketShareLabels"
        :key="share.name"
        class="flex items-center justify-between px-2 rounded-md"
      >
        <div class="flex items-center gap-3">
          <div
            class="h-8 w-1 rounded bg-primary"
            :style="{
              backgroundColor:
                marketShareCategories[nameToCategoryKey(share.name)].color
            }"
          />
          <div>
            <span class="font-medium text-sm text-foreground">{{ share.name }}</span>
            <span class="block text-xs text-muted-foreground">Browser</span>
          </div>
        </div>
        <span class="font-semibold text-lg text-foreground">{{ share.percentage }}%</span>
      </div>
    </div>
  </div>

  <Button
    class="w-full mt-6"
    variant="outline"
  >
    More Details   <ChevronRight class="h-4 w-4" />
  </Button>
</template>
