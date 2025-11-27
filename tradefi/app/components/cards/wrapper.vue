<script lang="ts" setup>
import { EllipsisIcon } from 'lucide-vue-next'
</script>

<template>
  <div class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-border py-6 shadow-sm">
    <div class="flex items-center justify-between px-6">
      <div class="flex items-center gap-2">
        <slot name="stats-header" />
      </div>
      <EllipsisIcon class="h-4 w-4 text-muted-foreground" />
    </div>
    <div class="px-6">
      <slot name="stats-body" />
    </div>
  </div>
</template>

