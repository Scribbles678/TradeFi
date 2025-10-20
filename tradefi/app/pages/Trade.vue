<template>
    <div class="space-y-8">
      <!-- Manual Trade Form -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Place a Trade</h3>
        </template>
        <!-- User Balance Inner Card -->
        <div class="mb-4 flex justify-end">
          <UCard class="w-fit bg-[#23272e] border border-gold-500 px-4 py-2">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gold font-semibold">Balance:</span>
              <span class="text-lg font-bold text-white">$12,345.67</span>
            </div>
          </UCard>
        </div>
        <!-- Buy/Sell Toggle -->
        <div class="flex mb-4">
          <button
            :class="[
              'flex-1 py-2 rounded-l-lg font-semibold text-lg transition-all',
              form.side === 'Buy' ? 'bg-green-500 text-white shadow' : 'bg-[#23272e] text-gray-400'
            ]"
            @click="form.side = 'Buy'"
            type="button"
          >
            Buy
          </button>
          <button
            :class="[
              'flex-1 py-2 rounded-r-lg font-semibold text-lg transition-all',
              form.side === 'Sell' ? 'bg-red-500 text-white shadow' : 'bg-[#23272e] text-gray-400'
            ]"
            @click="form.side = 'Sell'"
            type="button"
          >
            Sell
          </button>
        </div>
        <form @submit.prevent="placeOrder" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup label="Trading Pair">
            <USelect v-model="form.pair" :options="pairs" placeholder="Select pair" />
          </UFormGroup>
          <UFormGroup label="Order Type">
            <USelect v-model="form.type" :options="orderTypes" placeholder="Select type" />
          </UFormGroup>
          <UFormGroup label="Price" v-if="form.type === 'Limit'">
            <UInput v-model="form.price" type="number" placeholder="Enter price" />
          </UFormGroup>
          <UFormGroup label="Amount">
            <UInput v-model="form.amount" type="number" placeholder="Enter amount" />
          </UFormGroup>
          <!-- TP/SL Section -->
          <div class="md:col-span-1">
            <label class="block text-sm font-medium mb-1">Take Profit</label>
            <div class="flex items-center gap-2">
              <UInput v-model="form.tp" type="number" placeholder="Take Profit" class="flex-1" />
              <USelect v-model="form.tpType" :options="tpSlTypeOptions" class="w-24" />
            </div>
          </div>
          <div class="md:col-span-1">
            <label class="block text-sm font-medium mb-1">Stop Loss</label>
            <div class="flex items-center gap-2">
              <UInput v-model="form.sl" type="number" placeholder="Stop Loss" class="flex-1" />
              <USelect v-model="form.slType" :options="tpSlTypeOptions" class="w-24" />
            </div>
          </div>
          <div class="md:col-span-2 flex justify-end mt-2">
            <UButton
              :type="'submit'"
              :color="form.side === 'Buy' ? 'success' : 'error'"
              :label="form.side === 'Buy' ? 'Buy' : 'Sell'"
              variant="solid"
              class="w-40 text-lg font-bold"
            />
          </div>
        </form>
      </UCard>
  
      <!-- Close All Trades Button and Warning -->
      <div class="flex items-center gap-4">
        <UButton color="error" variant="solid" label="Close All Trades" @click="closeAllTrades" />
        <span class="text-red-400 font-semibold">Careful, this action will close out all open trades that you currently have</span>
      </div>
  
      <!-- Open Trades Table -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Open Trades</h3>
        </template>
        <UTable :columns="openColumns" :rows="openTrades" :ui="{ td: { base: 'max-w-0' } }">
          <template #actions-data="{ row }">
            <UButton icon="i-heroicons-pencil" color="neutral" variant="ghost" @click="editOrder(Number(row.id))" />
            <UButton icon="i-heroicons-trash" color="error" variant="ghost" @click="cancelOrder(Number(row.id))" />
          </template>
        </UTable>
      </UCard>
  
      <!-- Closed Trades Table with Timeframe Selector -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Closed Trades</h3>
            <UDropdown :items="timeframeOptions" @select="setClosedTimeframe">
              <UButton :icon="timeframeIcons[closedTimeframe]" color="neutral" variant="ghost" :label="closedTimeframeLabel[closedTimeframe]" />
            </UDropdown>
          </div>
        </template>
        <UTable :columns="closedColumns" :rows="closedTradesByTimeframe" :ui="{ td: { base: 'max-w-0' } }" />
      </UCard>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  
  const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT']
  const orderTypes = ['Market', 'Limit']
  const tpSlTypeOptions = ['USDT', '% ROI']
  
  const form = ref({
    pair: '',
    type: '',
    side: 'Buy',
    price: '',
    amount: '',
    tp: '',
    tpType: 'USDT',
    sl: '',
    slType: 'USDT'
  })
  
  function placeOrder() {
    // Mock: Add to openTrades
    if (form.value.pair && form.value.type && form.value.side && form.value.amount) {
      openTrades.value.push({
        id: Date.now(),
        pair: form.value.pair,
        type: form.value.type,
        side: form.value.side,
        price: form.value.type === 'Limit' ? form.value.price : 'Market',
        amount: form.value.amount,
        tp: form.value.tp,
        tpType: form.value.tpType,
        sl: form.value.sl,
        slType: form.value.slType,
        status: 'Open'
      })
      form.value = { pair: '', type: '', side: form.value.side, price: '', amount: '', tp: '', tpType: 'USDT', sl: '', slType: 'USDT' }
    }
  }
  
  function closeAllTrades() {
    openTrades.value = []
  }
  
  const openColumns = [
    { key: 'pair', label: 'Pair', id: 'pair' },
    { key: 'type', label: 'Type', id: 'type' },
    { key: 'side', label: 'Side', id: 'side' },
    { key: 'price', label: 'Price', id: 'price' },
    { key: 'amount', label: 'Amount', id: 'amount' },
    { key: 'tp', label: 'TP', id: 'tp' },
    { key: 'tpType', label: 'TP Type', id: 'tpType' },
    { key: 'sl', label: 'SL', id: 'sl' },
    { key: 'slType', label: 'SL Type', id: 'slType' },
    { key: 'status', label: 'Status', id: 'status' },
    { key: 'actions', label: 'Actions', id: 'actions' }
  ]
  
  const closedColumns = [
    { key: 'pair', label: 'Pair', id: 'pair' },
    { key: 'type', label: 'Type', id: 'type' },
    { key: 'side', label: 'Side', id: 'side' },
    { key: 'price', label: 'Price', id: 'price' },
    { key: 'amount', label: 'Amount', id: 'amount' },
    { key: 'pnl', label: 'P&L', id: 'pnl' },
    { key: 'status', label: 'Status', id: 'status' }
  ]
  
  const openTrades = ref([
    { id: 1, pair: 'BTC/USDT', type: 'Limit', side: 'Buy', price: '64000', amount: '0.1', tp: '65000', tpType: 'USDT', sl: '63000', slType: 'USDT', status: 'Open' },
    { id: 2, pair: 'ETH/USDT', type: 'Market', side: 'Sell', price: 'Market', amount: '1.5', tp: '', tpType: 'USDT', sl: '', slType: 'USDT', status: 'Open' }
  ])
  
  const closedTradesData = {
    '24h': [
      { id: 1, pair: 'BTC/USDT', type: 'Limit', side: 'Buy', price: '63000', amount: '0.1', pnl: '+$120', status: 'Closed' },
      { id: 2, pair: 'SOL/USDT', type: 'Market', side: 'Sell', price: 'Market', amount: '50', pnl: '-$30', status: 'Closed' }
    ],
    'week': [
      { id: 3, pair: 'ETH/USDT', type: 'Limit', side: 'Sell', price: '3200', amount: '0.5', pnl: '+$50', status: 'Closed' }
    ],
    'month': [
      { id: 4, pair: 'BTC/USDT', type: 'Market', side: 'Sell', price: 'Market', amount: '0.2', pnl: '+$200', status: 'Closed' }
    ],
    'year': [
      { id: 5, pair: 'SOL/USDT', type: 'Limit', side: 'Buy', price: '150', amount: '100', pnl: '+$1000', status: 'Closed' }
    ]
  }
  
  const closedTimeframe = ref<'24h' | 'week' | 'month' | 'year'>('24h')
  const timeframeOptions = [
    { label: '24h', value: '24h', icon: 'i-heroicons-clock' },
    { label: 'Week', value: 'week', icon: 'i-heroicons-calendar-days' },
    { label: 'Month', value: 'month', icon: 'i-heroicons-calendar' },
    { label: 'Year', value: 'year', icon: 'i-heroicons-calendar' }
  ]
  const timeframeIcons = {
    '24h': 'i-heroicons-clock',
    'week': 'i-heroicons-calendar-days',
    'month': 'i-heroicons-calendar',
    'year': 'i-heroicons-calendar'
  }
  const closedTimeframeLabel = {
    '24h': '24h',
    'week': 'Week',
    'month': 'Month',
    'year': 'Year'
  }
  function setClosedTimeframe(option: { value: '24h' | 'week' | 'month' | 'year' }) {
    closedTimeframe.value = option.value
  }
  const closedTradesByTimeframe = computed(() => closedTradesData[closedTimeframe.value])
  
  function editOrder(id: number) {
    // Mock: Show edit modal (not implemented)
    alert('Edit order ' + id)
  }
  function cancelOrder(id: number) {
    openTrades.value = openTrades.value.filter(o => o.id !== id)
  }
  </script> 