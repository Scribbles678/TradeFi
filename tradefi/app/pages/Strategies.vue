<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Trading Strategies</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Manage your trading strategies and Pine Scripts</p>
      </div>
      <UButton
        icon="i-heroicons-plus"
        label="Add Strategy"
        size="md"
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        @click="openAddStrategyModal"
      />
    </div>

    <!-- Fear and Greed Index Card -->
    <UCard class="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-2 border-purple-500/30">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-chart-pie" class="w-8 h-8 text-purple-400" />
            <div>
              <h3 class="text-xl font-bold text-white">Crypto Fear & Greed Index</h3>
              <p class="text-sm text-gray-300 mt-1">Real-time market sentiment indicator</p>
            </div>
          </div>
          <UButton
            icon="i-heroicons-arrow-path"
            size="sm"
            class="bg-purple-600 hover:bg-purple-700 text-white"
            :loading="loadingFearGreed"
            @click="loadFearGreedIndex"
          >
            Refresh
          </UButton>
        </div>
      </template>

      <div v-if="fearGreedData" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Index Value Display -->
        <div class="flex flex-col items-center justify-center bg-black/30 rounded-xl p-6">
          <div class="text-6xl font-bold mb-2" :class="getFearGreedColor(fearGreedData.value)">
            {{ fearGreedData.value }}
          </div>
          <div class="text-xl font-semibold text-white mb-1">
            {{ fearGreedData.value_classification }}
          </div>
          <div class="text-sm text-gray-400">
            Index Score
          </div>
        </div>

        <!-- Visual Gauge -->
        <div class="flex flex-col justify-center">
          <div class="relative h-4 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 rounded-full overflow-hidden">
            <div 
              class="absolute top-0 h-full w-1 bg-white shadow-lg"
              :style="{ left: `${fearGreedData.value}%` }"
            ></div>
          </div>
          <div class="flex justify-between text-xs text-gray-400 mt-2">
            <span>0 - Extreme Fear</span>
            <span>50 - Neutral</span>
            <span>100 - Extreme Greed</span>
          </div>
        </div>

        <!-- Interpretation -->
        <div class="bg-black/30 rounded-xl p-4">
          <h4 class="font-semibold text-white mb-2">Market Sentiment</h4>
          <p class="text-sm text-gray-300">
            {{ getFearGreedInterpretation(fearGreedData.value_classification) }}
          </p>
          <div class="mt-3 text-xs text-gray-400">
            <p>Last updated: {{ formatTimestamp(fearGreedData.timestamp) }}</p>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8">
        <UIcon name="i-heroicons-signal-slash" class="w-12 h-12 text-gray-500 mx-auto mb-3" />
        <p class="text-gray-400">Loading Fear & Greed Index...</p>
      </div>
    </UCard>

    <!-- Strategy List Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard
        v-for="strategy in strategies"
        :key="strategy.id"
        class="hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
      >
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1">
              <h4 class="font-bold text-lg text-gray-900 dark:text-white">{{ strategy.name }}</h4>
              <!-- Asset Class Badge -->
              <div v-if="strategy.asset_class" class="mt-2">
                <UBadge color="neutral" variant="outline" size="xs">
                  {{ strategy.asset_class.toUpperCase() }}
                </UBadge>
              </div>
            </div>
            <UBadge :color="getStatusColor(strategy.status)" size="sm">
              {{ strategy.status.toUpperCase() }}
            </UBadge>
          </div>
        </template>

        <div class="space-y-4">
          <!-- Description -->
          <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 min-h-[60px]">
            {{ strategy.description || 'No description provided for this strategy.' }}
          </p>

          <!-- Performance Metrics -->
          <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2.5">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400 font-medium">Success Rate</span>
              <span class="font-bold text-gray-900 dark:text-white">{{ strategy.success_rate?.toFixed(1) || '0.0' }}%</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400 font-medium">Avg Profit</span>
              <span :class="['font-bold', (strategy.avg_profit || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400']">
                {{ (strategy.avg_profit || 0) >= 0 ? '+' : '' }}{{ strategy.avg_profit?.toFixed(2) || '0.00' }}%
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400 font-medium">Total Trades</span>
              <span class="font-bold text-gray-900 dark:text-white">{{ strategy.total_trades || 0 }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400 font-medium">Risk Level</span>
              <UBadge 
                :color="strategy.risk_level === 'low' ? 'success' : strategy.risk_level === 'high' ? 'error' : 'warning'"
                size="xs"
                variant="soft"
              >
                {{ (strategy.risk_level || 'N/A').toUpperCase() }}
              </UBadge>
            </div>
          </div>

          <!-- Pine Script Status -->
          <div :class="[
            'flex items-center justify-between gap-2 p-3 rounded-lg text-sm font-medium',
            strategy.pine_script 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
              : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
          ]">
            <div class="flex items-center gap-2">
              <UIcon
                :name="strategy.pine_script ? 'i-heroicons-check-circle' : 'i-heroicons-exclamation-circle'"
                class="text-lg"
              />
              <span>{{ strategy.pine_script ? 'Pine Script Added' : 'No Pine Script' }}</span>
            </div>
            <UIcon name="i-heroicons-chevron-right" class="text-xs" />
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col gap-3 pt-4 border-t dark:border-gray-700">
            <!-- Pine Script Button - Primary Action -->
            <UButton
              icon="i-heroicons-code-bracket"
              label="View/Edit Pine Script"
              size="md"
              class="w-full justify-center font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              @click="openPineScriptModal(strategy)"
            />
            
            <div class="flex gap-2">
              <!-- Toggle Status Button -->
              <UButton
                :icon="strategy.status === 'active' ? 'i-heroicons-pause' : 'i-heroicons-play'"
                :label="strategy.status === 'active' ? 'Pause' : 'Activate'"
                size="md"
                :class="[
                  'flex-1 justify-center font-medium text-white',
                  strategy.status === 'active' 
                    ? 'bg-yellow-600 hover:bg-yellow-700' 
                    : 'bg-green-600 hover:bg-green-700'
                ]"
                @click="toggleStatus(strategy.id)"
              />
              
              <!-- Edit Button -->
              <UButton
                icon="i-heroicons-pencil"
                label="Edit"
                size="md"
                class="flex-1 justify-center font-medium bg-gray-600 hover:bg-gray-700 text-white"
                @click="openEditStrategyModal(strategy)"
              />
            </div>
          </div>
        </div>
      </UCard>

      <!-- Empty State -->
      <UCard v-if="strategies.length === 0" class="col-span-full">
        <div class="text-center py-12">
          <UIcon name="i-heroicons-chart-bar" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 dark:text-gray-400">No strategies yet</p>
          <UButton
            label="Add Your First Strategy"
            size="lg"
            class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            @click="openAddStrategyModal"
          />
        </div>
      </UCard>
    </div>

    <!-- Pine Script Editor Modal -->
    <UModal v-model="showPineScriptModal" :ui="{ width: 'sm:max-w-4xl' }">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold">Pine Script Editor</h3>
              <p class="text-sm text-gray-500 mt-1">{{ selectedStrategy?.name }}</p>
            </div>
            <UButton
              icon="i-heroicons-x-mark"
              size="sm"
              class="bg-gray-600 hover:bg-gray-700 text-white"
              @click="showPineScriptModal = false"
            />
          </div>
        </template>

        <div class="space-y-4">
          <!-- Version Selector -->
          <UFormGroup label="Pine Script Version">
            <USelect
              v-model="pineScriptVersion"
              :options="['v4', 'v5']"
            />
          </UFormGroup>

          <!-- Code Editor -->
          <UFormGroup label="Pine Script Code">
            <UTextarea
              v-model="pineScriptCode"
              :rows="20"
              placeholder="Paste your Pine Script code here..."
              class="font-mono text-sm"
            />
          </UFormGroup>

          <!-- Helper Text -->
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div class="flex gap-2">
              <UIcon name="i-heroicons-information-circle" class="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div class="text-sm text-blue-900 dark:text-blue-100">
                <p class="font-semibold mb-1">Tips:</p>
                <ul class="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                  <li>Copy your Pine Script from TradingView</li>
                  <li>Make sure it includes the @version directive</li>
                  <li>Test your strategy in TradingView before saving</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              label="Cancel"
              size="md"
              class="bg-gray-600 hover:bg-gray-700 text-white"
              @click="showPineScriptModal = false"
            />
            <UButton
              label="Save Pine Script"
              size="md"
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              :loading="saving"
              @click="savePineScript"
            />
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Add/Edit Strategy Modal -->
    <UModal v-model="showStrategyModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingStrategy ? 'Edit Strategy' : 'Add New Strategy' }}
          </h3>
        </template>

        <form @submit.prevent="saveStrategy" class="space-y-4">
          <UFormGroup label="Strategy Name" required>
            <UInput v-model="strategyForm.name" placeholder="Enter strategy name" />
          </UFormGroup>

          <UFormGroup label="Description">
            <UTextarea
              v-model="strategyForm.description"
              placeholder="Enter strategy description"
              :rows="3"
            />
          </UFormGroup>

          <UFormGroup label="Asset Class">
            <USelect
              v-model="strategyForm.asset_class"
              :options="assetClassOptions"
              placeholder="Select asset class"
            />
          </UFormGroup>

          <UFormGroup label="Risk Level">
            <USelect
              v-model="strategyForm.risk_level"
              :options="riskLevelOptions"
              placeholder="Select risk level"
            />
          </UFormGroup>

          <UFormGroup label="Timeframe">
            <USelect
              v-model="strategyForm.timeframe"
              :options="timeframeOptions"
              placeholder="Select timeframe"
            />
          </UFormGroup>

          <div class="flex justify-end gap-3 pt-4">
            <UButton
              label="Cancel"
              size="md"
              class="bg-gray-600 hover:bg-gray-700 text-white"
              @click="showStrategyModal = false"
            />
            <UButton
              type="submit"
              :label="editingStrategy ? 'Update Strategy' : 'Create Strategy'"
              size="md"
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              :loading="saving"
            />
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  getStrategies,
  createStrategy,
  updateStrategy,
  updateStrategyPineScript,
  toggleStrategyStatus as toggleStrategyStatusAPI,
  type Strategy
} from '~/utils/supabase';

// State
const strategies = ref<Strategy[]>([]);
const showPineScriptModal = ref(false);
const showStrategyModal = ref(false);
const selectedStrategy = ref<Strategy | null>(null);
const editingStrategy = ref<Strategy | null>(null);
const pineScriptCode = ref('');
const pineScriptVersion = ref('v5');
const saving = ref(false);

// Fear and Greed Index state
const fearGreedData = ref<any>(null);
const loadingFearGreed = ref(false);

// Form state
const strategyForm = ref({
  name: '',
  description: '',
  asset_class: null as 'forex' | 'crypto' | 'options' | null,
  risk_level: null as 'low' | 'medium' | 'high' | null,
  timeframe: null as string | null,
});

// Options
const assetClassOptions = [
  { label: 'Forex', value: 'forex' },
  { label: 'Crypto', value: 'crypto' },
  { label: 'Options', value: 'options' },
];

const riskLevelOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

const timeframeOptions = [
  { label: '1 Minute', value: '1m' },
  { label: '5 Minutes', value: '5m' },
  { label: '15 Minutes', value: '15m' },
  { label: '30 Minutes', value: '30m' },
  { label: '1 Hour', value: '1h' },
  { label: '4 Hours', value: '4h' },
  { label: '1 Day', value: '1d' },
  { label: '1 Week', value: '1w' },
];

// Load strategies
async function loadStrategies() {
  strategies.value = await getStrategies();
}

// Load Fear and Greed Index
async function loadFearGreedIndex() {
  loadingFearGreed.value = true;
  try {
    const response = await fetch('https://api.alternative.me/fng/');
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      fearGreedData.value = data.data[0];
    }
  } catch (error) {
    console.error('Error fetching Fear & Greed Index:', error);
  } finally {
    loadingFearGreed.value = false;
  }
}

// Get color based on Fear & Greed value
function getFearGreedColor(value: string) {
  const numValue = parseInt(value);
  if (numValue <= 25) return 'text-red-500';
  if (numValue <= 45) return 'text-orange-500';
  if (numValue <= 55) return 'text-yellow-500';
  if (numValue <= 75) return 'text-green-500';
  return 'text-emerald-500';
}

// Get interpretation based on classification
function getFearGreedInterpretation(classification: string) {
  const interpretations: Record<string, string> = {
    'Extreme Fear': 'Market is in extreme fear. This could indicate a buying opportunity as prices may be undervalued.',
    'Fear': 'Market sentiment is fearful. Investors are worried, which might present good entry points.',
    'Neutral': 'Market sentiment is balanced. Neither fear nor greed is dominating the market.',
    'Greed': 'Market sentiment is greedy. Be cautious as prices might be getting overvalued.',
    'Extreme Greed': 'Market is in extreme greed. High risk of correction. Consider taking profits or being more cautious.'
  };
  return interpretations[classification] || 'Market sentiment indicator for crypto markets.';
}

// Format timestamp
function formatTimestamp(timestamp: string) {
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleString();
}

// Open Pine Script Modal
function openPineScriptModal(strategy: Strategy) {
  selectedStrategy.value = strategy;
  pineScriptCode.value = strategy.pine_script || '';
  pineScriptVersion.value = strategy.pine_script_version || 'v5';
  showPineScriptModal.value = true;
}

// Save Pine Script
async function savePineScript() {
  if (!selectedStrategy.value) return;

  if (!pineScriptCode.value.trim()) {
    alert('Please enter Pine Script code');
    return;
  }

  saving.value = true;
  try {
    const success = await updateStrategyPineScript(
      selectedStrategy.value.id,
      pineScriptCode.value,
      pineScriptVersion.value
    );

    if (success) {
      showPineScriptModal.value = false;
      await loadStrategies();
      alert('Pine Script saved successfully!');
    } else {
      alert('Error saving Pine Script. Please check the console for details.');
    }
  } catch (error) {
    console.error('Error saving Pine Script:', error);
    alert('Error saving Pine Script. Please make sure the database is set up correctly.');
  } finally {
    saving.value = false;
  }
}

// Open Add Strategy Modal
function openAddStrategyModal() {
  editingStrategy.value = null;
  strategyForm.value = {
    name: '',
    description: '',
    asset_class: null,
    risk_level: null,
    timeframe: null,
  };
  showStrategyModal.value = true;
}

// Open Edit Strategy Modal
function openEditStrategyModal(strategy: Strategy) {
  editingStrategy.value = strategy;
  strategyForm.value = {
    name: strategy.name,
    description: strategy.description || '',
    asset_class: strategy.asset_class,
    risk_level: strategy.risk_level,
    timeframe: strategy.timeframe,
  };
  showStrategyModal.value = true;
}

// Save Strategy (Create or Update)
async function saveStrategy() {
  if (!strategyForm.value.name) {
    alert('Please enter a strategy name');
    return;
  }

  saving.value = true;
  try {
    let result;
    if (editingStrategy.value) {
      // Update existing strategy
      result = await updateStrategy(editingStrategy.value.id, strategyForm.value);
    } else {
      // Create new strategy
      result = await createStrategy({
        ...strategyForm.value,
        status: 'inactive',
      });
    }
    
    if (result) {
      showStrategyModal.value = false;
      await loadStrategies();
      alert(editingStrategy.value ? 'Strategy updated successfully!' : 'Strategy created successfully!');
    } else {
      alert('Error saving strategy. Please check the console for details.');
    }
  } catch (error) {
    console.error('Error saving strategy:', error);
    alert('Error saving strategy. Please make sure the database is set up correctly.');
  } finally {
    saving.value = false;
  }
}

// Toggle Strategy Status
async function toggleStatus(id: string) {
  await toggleStrategyStatusAPI(id);
  await loadStrategies();
}

// Helper function for status colors
function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'neutral';
    case 'testing':
      return 'warning';
    default:
      return 'neutral';
  }
}

// Initial load
onMounted(async () => {
  await loadStrategies();
  await loadFearGreedIndex();
});

// Page meta
definePageMeta({
  title: 'Strategies',
  description: 'Manage your trading strategies'
});
</script>
