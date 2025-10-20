<template>
    <div class="space-y-8">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Open Positions Summary</h3>
            <UButton icon="i-heroicons-arrow-down-tray" color="primary" variant="solid" label="Download PDF" @click="downloadPDF" />
          </div>
        </template>
        <UTable :columns="columns" :rows="positions" :ui="{ td: { base: 'max-w-0' } }">
          <template #side-data="{ row }">
            <UBadge :color="(row as any).side === 'Long' ? 'success' : 'error'">
              {{ (row as any).side }}
            </UBadge>
          </template>
          <template #pnl-data="{ row }">
            <span :class="(row as any).pnl.startsWith('+') ? 'text-green-500' : 'text-red-500'">{{ (row as any).pnl }}</span>
          </template>
        </UTable>
      </UCard>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  
  const columns = [
    { key: 'pair', label: 'Pair', id: 'pair' },
    { key: 'side', label: 'Side', id: 'side' },
    { key: 'entry', label: 'Entry Price', id: 'entry' },
    { key: 'mark', label: 'Mark Price', id: 'mark' },
    { key: 'pnl', label: 'P&L', id: 'pnl' },
    { key: 'size', label: 'Size', id: 'size' }
  ]
  
  const positions = ref([
    { id: 1, pair: 'BTC/USDT', side: 'Long', entry: '64000', mark: '64500', pnl: '+$500', size: '0.1 BTC' },
    { id: 2, pair: 'ETH/USDT', side: 'Short', entry: '3200', mark: '3150', pnl: '+$75', size: '2 ETH' },
    { id: 3, pair: 'SOL/USDT', side: 'Long', entry: '150', mark: '148', pnl: '-$20', size: '100 SOL' }
  ])
  
  function downloadPDF() {
    // Placeholder for PDF download logic
    alert('Download PDF coming soon!')
  }
  </script> 