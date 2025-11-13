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
          <div class="flex items-center gap-2">
            <button
              :class="[
                'flex-1 flex items-center justify-between gap-2 p-3 rounded-lg text-sm font-medium cursor-pointer hover:opacity-80 transition-all',
                strategy.pine_script 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
                  : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
              ]"
              @click="openPineScriptModal(strategy, $event)"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="strategy.pine_script ? 'i-heroicons-check-circle' : 'i-heroicons-exclamation-circle'"
                  class="text-lg"
                />
                <span>{{ strategy.pine_script ? 'Pine Script Added' : 'No Pine Script' }}</span>
              </div>
              <UIcon name="i-heroicons-chevron-right" class="text-xs" />
            </button>
            <UButton
              v-if="strategy.pine_script"
              icon="i-heroicons-pencil"
              size="sm"
              class="bg-blue-600 hover:bg-blue-700 text-white"
              @click="openPineScriptModal(strategy, $event)"
              title="Edit Pine Script"
            />
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col gap-3 pt-4 border-t dark:border-gray-700">
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
              
              <!-- Delete Button -->
              <UButton
                icon="i-heroicons-trash"
                label="Delete"
                size="md"
                class="flex-1 justify-center font-medium bg-red-600 hover:bg-red-700 text-white"
                @click="deleteStrategyConfirm(strategy)"
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
    <UModal 
      v-if="showPineScriptModal"
      v-model="showPineScriptModal" 
      :ui="{ 
        width: pineScriptModalPosition ? `${pineScriptModalPosition.width}px` : 'sm:max-w-4xl',
        overlay: { base: 'fixed inset-0 z-50 bg-black/50' },
        container: { base: 'fixed inset-0 z-50 flex items-center justify-center p-4' },
        inner: { base: 'relative' }
      }"
    >
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
    <UModal 
      v-if="showStrategyModal"
      v-model="showStrategyModal"
    >
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
import { ref, onMounted, nextTick, watch } from 'vue';
import {
  getStrategies,
  createStrategy,
  updateStrategy,
  updateStrategyPineScript,
  deleteStrategy as deleteStrategyAPI,
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
const pineScriptModalPosition = ref<{ x: number; y: number; width: number } | null>(null);


// Form state
const strategyForm = ref({
  name: '',
  description: '',
  asset_class: null as 'forex' | 'crypto' | 'options' | 'stocks' | 'futures' | null,
  risk_level: null as 'low' | 'medium' | 'high' | null,
  timeframe: null as string | null,
});

// Options
const assetClassOptions = [
  { label: 'Forex', value: 'forex' },
  { label: 'Crypto', value: 'crypto' },
  { label: 'Stocks', value: 'stocks' },
  { label: 'Options', value: 'options' },
  { label: 'Futures', value: 'futures' },
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


// Open Pine Script Modal
function openPineScriptModal(strategy: Strategy, event?: Event) {
  selectedStrategy.value = strategy;
  pineScriptCode.value = strategy.pine_script || '';
  pineScriptVersion.value = strategy.pine_script_version || 'v5';
  
  // Calculate position to center modal over the card
  if (event && event.currentTarget) {
    const cardElement = (event.currentTarget as HTMLElement).closest('.hover\\:shadow-xl') as HTMLElement;
    if (cardElement) {
      const rect = cardElement.getBoundingClientRect();
      pineScriptModalPosition.value = {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width
      };
    }
  } else {
    pineScriptModalPosition.value = null;
  }
  
  showPineScriptModal.value = true;
  // Prevent body scroll when modal opens
  nextTick(() => {
    document.body.style.overflow = 'hidden';
  });
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
      pineScriptModalPosition.value = null;
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
  // Scroll to top when modal opens
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.style.overflow = 'hidden';
  });
}

// Open Edit Strategy Modal
function openEditStrategyModal(strategy: Strategy) {
  editingStrategy.value = strategy;
  // Scroll to top when modal opens
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.style.overflow = 'hidden';
  });
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
  try {
    const result = await toggleStrategyStatusAPI(id);
    if (result) {
      await loadStrategies();
      
      // Notify the bot to reload strategies
      try {
        const response = await $fetch('/api/sparky/strategies/reload', {
          method: 'POST',
        });
        if (response.success) {
          console.log('Bot strategies reloaded successfully');
        }
      } catch (error) {
        console.warn('Failed to notify bot to reload strategies. The bot may need to be restarted for changes to take effect:', error);
        // Don't show error to user - this is a non-critical operation
      }
    }
  } catch (error) {
    console.error('Error toggling strategy status:', error);
    alert('Error toggling strategy status. Please check the console for details.');
  }
}

// Delete Strategy (with confirmation)
async function deleteStrategyConfirm(strategy: Strategy) {
  if (!confirm(`Are you sure you want to delete "${strategy.name}"? This action cannot be undone.`)) {
    return;
  }

  try {
    const success = await deleteStrategyAPI(strategy.id);
    if (success) {
      await loadStrategies();
      alert('Strategy deleted successfully!');
    } else {
      console.error('Delete strategy returned false. Check browser console for Supabase error details.');
      alert('Error deleting strategy. Please check the browser console for details and ensure Row Level Security (RLS) is disabled or properly configured for the strategies table.');
    }
  } catch (error) {
    console.error('Error deleting strategy:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    alert(`Error deleting strategy: ${errorMessage}. Please check the console for details and ensure database permissions are set correctly.`);
  }
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

// Watch modals to restore body scroll when closed
watch(showStrategyModal, (isOpen) => {
  if (!isOpen) {
    document.body.style.overflow = '';
  }
});

watch(showPineScriptModal, (isOpen) => {
  if (!isOpen) {
    document.body.style.overflow = '';
    pineScriptModalPosition.value = null;
  }
});

// Initial load
onMounted(async () => {
  await loadStrategies();
});

// Page meta
definePageMeta({
  title: 'Strategies',
  description: 'Manage your trading strategies'
});
</script>
