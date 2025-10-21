<template>
    <div class="space-y-6">
      <!-- Bot Creation Section -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Create New Trading Bot</h3>
            <UButton
              icon="i-heroicons-plus"
              label="Create Bot"
              size="md"
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              @click="showCreateBotModal = true"
            />
          </div>
        </template>
      </UCard>
  
      <!-- Bot List Section -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">My Trading Bots</h3>
        </template>
        <UTable
          :columns="botColumns"
          :rows="tradingBots"
          :ui="{ td: { base: 'max-w-0' } }"
        >
          <template #status-data="{ row }">
            <UBadge :color="(row as any).status === 'Running' ? 'success' : 'warning'">
              {{ (row as any).status }}
            </UBadge>
          </template>
          <template #actions-data="{ row }">
            <div class="flex space-x-2">
              <UButton
                :icon="(row as any).status === 'Running' ? 'i-heroicons-pause' : 'i-heroicons-play'"
                size="sm"
                :class="(row as any).status === 'Running' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'"
                @click="toggleBotStatus(Number((row as any).id))"
              />
              <UButton
                icon="i-heroicons-cog-6-tooth"
                size="sm"
                class="bg-gray-600 hover:bg-gray-700 text-white"
                @click="editBot(Number((row as any).id))"
              />
            </div>
          </template>
        </UTable>
      </UCard>
  
      <!-- Create Bot Modal -->
      <UModal v-model="showCreateBotModal">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Create New Trading Bot</h3>
          </template>
  
          <form @submit.prevent="createBot" class="space-y-4">
            <UFormGroup label="Bot Name">
              <UInput v-model="newBot.name" placeholder="Enter bot name" />
            </UFormGroup>
  
            <UFormGroup label="Trading Pair">
              <USelect
                v-model="newBot.pair"
                :options="tradingPairs"
                placeholder="Select trading pair"
              />
            </UFormGroup>
  
            <UFormGroup label="Strategy">
              <USelect
                v-model="newBot.strategy"
                :options="strategies"
                placeholder="Select strategy"
              />
            </UFormGroup>
  
            <div class="flex justify-end gap-3">
              <UButton
                label="Cancel"
                size="md"
                class="bg-gray-600 hover:bg-gray-700 text-white"
                @click="showCreateBotModal = false"
              />
              <UButton
                type="submit"
                label="Create Bot"
                size="md"
                class="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              />
            </div>
          </form>
        </UCard>
      </UModal>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  
  const showCreateBotModal = ref(false)
  
  const botColumns = [
    {
      key: 'name',
      label: 'Bot Name',
      id: 'name'
    },
    {
      key: 'strategy',
      label: 'Strategy',
      id: 'strategy'
    },
    {
      key: 'pair',
      label: 'Trading Pair',
      id: 'pair'
    },
    {
      key: 'status',
      label: 'Status',
      id: 'status'
    },
    {
      key: 'actions',
      label: 'Actions',
      id: 'actions'
    }
  ]
  
  const tradingPairs = [
    'BTC/USDT',
    'ETH/USDT',
    'SOL/USDT',
    'BNB/USDT',
    'XRP/USDT'
  ]
  
  const strategies = [
    'Scalping',
    'Swing Trading',
    'Grid Trading',
    'Arbitrage',
    'Market Making'
  ]
  
  const tradingBots = [
    {
      id: 1,
      name: 'BTC/USDT Scalper',
      strategy: 'Scalping',
      pair: 'BTC/USDT',
      status: 'Running'
    },
    {
      id: 2,
      name: 'ETH/USDT Swing',
      strategy: 'Swing Trading',
      pair: 'ETH/USDT',
      status: 'Running'
    },
    {
      id: 3,
      name: 'SOL/USDT Grid',
      strategy: 'Grid Trading',
      pair: 'SOL/USDT',
      status: 'Paused'
    }
  ]
  
  const newBot = ref({
    name: '',
    pair: '',
    strategy: ''
  })
  
  const createBot = () => {
    console.log('Creating new bot:', newBot.value)
    showCreateBotModal.value = false
    newBot.value = { name: '', pair: '', strategy: '' }
  }
  
  const toggleBotStatus = (id: number) => {
    console.log('Toggling bot status:', id)
  }
  
  const editBot = (id: number) => {
    console.log('Editing bot:', id)
  }
  </script> 