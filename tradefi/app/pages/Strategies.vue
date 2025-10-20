<template>
    <div class="space-y-6">
      <!-- Strategy List Section -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Available Strategies</h3>
            <UButton
              icon="i-heroicons-plus"
              label="Add Strategy"
              @click="showAddStrategyModal = true"
            />
          </div>
        </template>
  
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard
            v-for="strategy in strategies"
            :key="strategy.id"
            class="hover:shadow-lg transition-shadow"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <h4 class="font-semibold">{{ strategy.name }}</h4>
                <UBadge :color="strategy.status === 'Active' ? 'success' : 'warning'">
                  {{ strategy.status }}
                </UBadge>
              </div>
            </template>
  
            <div class="space-y-4">
              <div class="text-sm text-gray-500">
                {{ strategy.description }}
              </div>
  
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Success Rate:</span>
                  <span class="font-medium">{{ strategy.successRate }}%</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Average Profit:</span>
                  <span class="font-medium text-green-500">+{{ strategy.avgProfit }}%</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Risk Level:</span>
                  <span class="font-medium">{{ strategy.riskLevel }}</span>
                </div>
              </div>
  
              <div class="flex justify-end space-x-2">
                <UButton
                  icon="i-heroicons-cog-6-tooth"
                  color="neutral"
                  variant="ghost"
                  @click="editStrategy(strategy.id)"
                />
                <UButton
                  :icon="strategy.status === 'Active' ? 'i-heroicons-pause' : 'i-heroicons-play'"
                  :color="strategy.status === 'Active' ? 'error' : 'success'"
                  variant="ghost"
                  @click="toggleStrategyStatus(strategy.id)"
                />
              </div>
            </div>
          </UCard>
        </div>
      </UCard>
  
      <!-- Add Strategy Modal -->
      <UModal v-model="showAddStrategyModal">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Add New Strategy</h3>
          </template>
  
          <form @submit.prevent="addStrategy" class="space-y-4">
            <UFormGroup label="Strategy Name">
              <UInput v-model="newStrategy.name" placeholder="Enter strategy name" />
            </UFormGroup>
  
            <UFormGroup label="Description">
              <UTextarea
                v-model="newStrategy.description"
                placeholder="Enter strategy description"
              />
            </UFormGroup>
  
            <UFormGroup label="Risk Level">
              <USelect
                v-model="newStrategy.riskLevel"
                :options="riskLevels"
                placeholder="Select risk level"
              />
            </UFormGroup>
  
            <div class="flex justify-end space-x-2">
              <UButton
                label="Cancel"
                color="neutral"
                variant="ghost"
                @click="showAddStrategyModal = false"
              />
              <UButton
                type="submit"
                label="Add"
                color="primary"
              />
            </div>
          </form>
        </UCard>
      </UModal>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  
  const showAddStrategyModal = ref(false)
  
  const riskLevels = ['Low', 'Medium', 'High']
  
  const strategies = [
    {
      id: 1,
      name: 'Scalping Strategy',
      description: 'Quick trades with small profit targets, focusing on high-frequency opportunities.',
      status: 'Active',
      successRate: 75,
      avgProfit: 1.2,
      riskLevel: 'Medium'
    },
    {
      id: 2,
      name: 'Swing Trading',
      description: 'Medium-term trades capturing larger price movements over days or weeks.',
      status: 'Active',
      successRate: 65,
      avgProfit: 5.8,
      riskLevel: 'Medium'
    },
    {
      id: 3,
      name: 'Grid Trading',
      description: 'Automated buy and sell orders at predetermined price levels.',
      status: 'Inactive',
      successRate: 80,
      avgProfit: 3.5,
      riskLevel: 'Low'
    },
    {
      id: 4,
      name: 'Arbitrage',
      description: 'Exploiting price differences between different exchanges.',
      status: 'Active',
      successRate: 90,
      avgProfit: 0.8,
      riskLevel: 'Low'
    },
    {
      id: 5,
      name: 'Market Making',
      description: 'Providing liquidity by placing both buy and sell orders.',
      status: 'Inactive',
      successRate: 85,
      avgProfit: 2.1,
      riskLevel: 'Medium'
    }
  ]
  
  const newStrategy = ref({
    name: '',
    description: '',
    riskLevel: ''
  })
  
  const addStrategy = () => {
    console.log('Adding new strategy:', newStrategy.value)
    showAddStrategyModal.value = false
    newStrategy.value = { name: '', description: '', riskLevel: '' }
  }
  
  const editStrategy = (id: number) => {
    console.log('Editing strategy:', id)
  }
  
  const toggleStrategyStatus = (id: number) => {
    console.log('Toggling strategy status:', id)
  }
  </script> 