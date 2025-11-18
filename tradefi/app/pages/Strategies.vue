<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold">Trading Strategies</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">
          Manage your own strategies or explore the marketplace
        </p>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <div class="bg-gray-900/40 border border-gray-700 rounded-2xl p-1 flex items-center">
          <button
            v-for="view in strategyViews"
            :key="view.key"
            @click="strategyView = view.key"
            :class="[
              'px-4 py-2 text-sm font-semibold rounded-2xl transition-all',
              strategyView === view.key
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            ]"
          >
            {{ view.label }}
          </button>
        </div>
        <UButton
          v-if="strategyView === 'your'"
          icon="i-heroicons-plus"
          label="Add Strategy"
          size="md"
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          @click="openAddStrategyModal"
        />
      </div>
    </div>

    <!-- Marketplace Banner -->
    <UAlert
      v-if="strategyView === 'marketplace'"
      icon="i-heroicons-megaphone"
      title="Marketplace Strategies (Alpha)"
      description="Discover entrepreneurs offering their automated alerts for a revenue share. Due diligence recommended before subscribing."
      color="info"
      variant="soft"
    />

    <!-- Strategy List Section -->
    <div v-if="strategyView === 'your'" class="space-y-6">
      <!-- Add New Strategy Card (At Top - Always First) -->
      <Transition name="fade">
        <UCard
          v-if="showStrategyModal && !editingStrategyId"
          key="add-strategy-card"
          data-add-strategy-card
          class="w-full shadow-2xl border-2 border-green-500 dark:border-green-400 z-10 hover:shadow-xl transition-all duration-300"
        >
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Add New Strategy</h3>
            <UButton
              icon="i-heroicons-x-mark"
              size="sm"
              variant="ghost"
              class="text-gray-400 hover:text-gray-600"
              @click="cancelAddStrategy()"
            />
          </div>
        </template>

        <form @submit.prevent="saveStrategy" class="space-y-4">
          <!-- Strategy Name -->
          <UFormField label="Strategy Name" help="A descriptive name for your trading strategy">
            <UInput 
              v-model="strategyForm.name" 
              placeholder="e.g., Momentum Breakout Strategy"
              icon="i-heroicons-tag"
              autofocus
              required
            />
          </UFormField>

          <!-- Description -->
          <UFormField label="Description" help="Brief description of what this strategy does">
            <UTextarea
              v-model="strategyForm.description"
              placeholder="Describe your strategy's approach, entry/exit conditions, etc."
              :rows="3"
            />
          </UFormField>

          <!-- Asset Class - Multi-select Pills -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Asset Classes
            </label>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Select all asset classes this strategy trades</p>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="option in assetClassOptions"
                :key="option.value"
                :variant="selectedAssetClasses.includes(option.value) ? 'solid' : 'outline'"
                :color="selectedAssetClasses.includes(option.value) ? 'primary' : undefined"
                :class="selectedAssetClasses.includes(option.value) ? '' : 'text-gray-400'"
                size="sm"
                @click="toggleAssetClass(option.value)"
              >
                {{ option.label }}
              </UButton>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <UButton
              type="button"
              label="Cancel"
              size="md"
              variant="ghost"
              class="w-full sm:w-auto text-gray-400 hover:text-gray-600"
              @click="cancelAddStrategy()"
            />
            <UButton
              type="submit"
              label="Create Strategy"
              size="md"
              icon="i-heroicons-check"
              class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              :loading="saving"
            />
          </div>
        </form>
        </UCard>
      </Transition>

      <!-- Existing Strategy Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard
          v-for="strategy in strategies"
          :key="strategy.id"
          :data-strategy-id="strategy.id"
          :class="[
            'hover:shadow-xl transition-all duration-300',
            editingStrategyId === strategy.id 
              ? 'md:col-span-2 lg:col-span-3 shadow-2xl border-2 border-blue-500 dark:border-blue-400 z-10' 
              : 'hover:scale-[1.02]'
          ]"
        >
        <template #header>
          <!-- Edit Mode Header -->
          <div v-if="editingStrategyId === strategy.id">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Edit Strategy</h3>
              <UButton
                icon="i-heroicons-x-mark"
                size="sm"
                variant="ghost"
                class="text-gray-400 hover:text-gray-600"
                @click="cancelEdit()"
              />
            </div>
          </div>
          
          <!-- View Mode Header -->
          <div v-else class="flex items-start justify-between gap-3">
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

        <!-- Edit Form -->
        <form v-if="editingStrategyId === strategy.id" @submit.prevent="saveStrategy()" class="space-y-4">
          <!-- Strategy Name -->
          <UFormField label="Strategy Name" help="A descriptive name for your trading strategy">
            <UInput 
              v-model="strategyForm.name" 
              placeholder="e.g., Momentum Breakout Strategy"
              icon="i-heroicons-tag"
              autofocus
              required
            />
          </UFormField>

          <!-- Description -->
          <UFormField label="Description" help="Brief description of what this strategy does">
            <UTextarea
              v-model="strategyForm.description"
              placeholder="Describe your strategy's approach, entry/exit conditions, etc."
              :rows="3"
            />
          </UFormField>

          <!-- Asset Class - Multi-select Pills -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Asset Classes
            </label>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Select all asset classes this strategy trades</p>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="option in assetClassOptions"
                :key="option.value"
                :variant="selectedAssetClasses.includes(option.value) ? 'solid' : 'outline'"
                :color="selectedAssetClasses.includes(option.value) ? 'primary' : 'gray'"
                size="sm"
                @click="toggleAssetClass(option.value)"
              >
                {{ option.label }}
              </UButton>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <UButton
              type="button"
              label="Cancel"
              size="md"
              variant="ghost"
              class="w-full sm:w-auto text-gray-400 hover:text-gray-600"
              @click="cancelEdit()"
            />
            <UButton
              type="submit"
              label="Save Changes"
              size="md"
              icon="i-heroicons-check"
              class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              :loading="saving"
            />
          </div>
        </form>

        <!-- View Mode Content -->
        <div v-else class="space-y-4">
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
                @click="startEditStrategy(strategy)"
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
      </div>

      <!-- Empty State -->
      <UCard v-if="strategies.length === 0 && !showStrategyModal" class="w-full">
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

    <!-- Marketplace Strategies -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <UCard
        v-for="strategy in marketplaceStrategies"
        :key="strategy.id"
        class="border border-yellow-500/20 bg-gradient-to-br from-slate-900/60 to-slate-800/40"
      >
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <UIcon :name="strategy.traderIcon" class="w-5 h-5 text-yellow-400" />
                <span class="text-xs text-yellow-400 font-semibold uppercase tracking-wide">
                  Featured Trader
                </span>
              </div>
              <h3 class="text-xl font-semibold text-white mt-1">{{ strategy.name }}</h3>
              <p class="text-sm text-gray-400">{{ strategy.tradingStyle }}</p>
            </div>
            <div class="text-right space-y-1">
              <UBadge color="success" size="sm">{{ strategy.royalty }}% Royalty</UBadge>
              <p class="text-xs text-gray-500">Tracked {{ strategy.trackedDuration }}</p>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <p class="text-sm text-gray-300">
            {{ strategy.description }}
          </p>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="bg-black/20 rounded-lg p-3 border border-gray-700/50">
              <p class="text-xs text-gray-400">Live Trades</p>
              <p class="text-xl font-bold text-white">{{ strategy.liveTrades }}</p>
            </div>
            <div class="bg-black/20 rounded-lg p-3 border border-gray-700/50">
              <p class="text-xs text-gray-400">Win Rate</p>
              <p class="text-xl font-bold text-green-400">{{ strategy.winRate }}%</p>
            </div>
            <div class="bg-black/20 rounded-lg p-3 border border-gray-700/50">
              <p class="text-xs text-gray-400">Total Profit</p>
              <p
                class="text-xl font-bold"
                :class="strategy.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'"
              >
                {{ strategy.totalProfit >= 0 ? '+' : '' }}${{ strategy.totalProfit.toLocaleString() }}
              </p>
            </div>
            <div class="bg-black/20 rounded-lg p-3 border border-gray-700/50">
              <p class="text-xs text-gray-400">Tracked Length</p>
              <p class="text-xl font-bold text-white">{{ strategy.trackedDuration }}</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 pt-2 border-t border-gray-700/50">
            <UBadge
              v-for="asset in strategy.assetClasses"
              :key="asset"
              color="neutral"
              variant="outline"
              size="xs"
            >
              {{ asset.toUpperCase() }}
            </UBadge>
          </div>

          <div class="flex flex-col gap-2 pt-3">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-user-circle" class="w-5 h-5 text-gray-400" />
              <div>
                <p class="text-sm font-semibold text-white">{{ strategy.trader }}</p>
                <p class="text-xs text-gray-500">{{ strategy.traderExperience }}</p>
              </div>
            </div>
            <div class="flex gap-2">
              <UButton
                label="View Trader Bio"
                variant="outline"
                size="sm"
                @click="viewTraderBio(strategy)"
              />
              <UButton
                label="Request Access"
                icon="i-heroicons-bolt"
                size="sm"
                class="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                @click="requestAccess(strategy)"
              />
            </div>
          </div>
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
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Pine Script Version
              </label>
              <div class="flex gap-2">
                <UButton
                  :variant="pineScriptVersion === 'v4' ? 'solid' : 'outline'"
                  :color="pineScriptVersion === 'v4' ? 'primary' : 'gray'"
                  size="sm"
                  @click="pineScriptVersion = 'v4'"
                >
                  v4
                </UButton>
                <UButton
                  :variant="pineScriptVersion === 'v5' ? 'solid' : 'outline'"
                  :color="pineScriptVersion === 'v5' ? 'primary' : 'gray'"
                  size="sm"
                  @click="pineScriptVersion = 'v5'"
                >
                  v5
                </UButton>
              </div>
            </div>

            <!-- Code Editor -->
            <UFormField label="Pine Script Code">
              <UTextarea
                v-model="pineScriptCode"
                :rows="20"
                placeholder="Paste your Pine Script code here..."
                class="font-mono text-sm"
              />
            </UFormField>

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

// View toggle
const strategyViews = [
  { key: 'your' as const, label: 'Your Strategies' },
  { key: 'marketplace' as const, label: 'Marketplace Strategies' }
];

const strategyView = ref<'your' | 'marketplace'>('your');

// State
const strategies = ref<Strategy[]>([]);
const showPineScriptModal = ref(false);
const showStrategyModal = ref(false);
const selectedStrategy = ref<Strategy | null>(null);
const editingStrategy = ref<Strategy | null>(null);
const editingStrategyId = ref<string | null>(null);
const pineScriptCode = ref('');
const pineScriptVersion = ref('v5');
const saving = ref(false);
const pineScriptModalPosition = ref<{ x: number; y: number; width: number } | null>(null);

interface MarketplaceStrategy {
  id: string;
  name: string;
  tradingStyle: string;
  description: string;
  liveTrades: number;
  winRate: number;
  totalProfit: number;
  assetClasses: string[];
  royalty: number;
  trackedDuration: string;
  trader: string;
  traderExperience: string;
  traderIcon: string;
  bio: string;
}

const marketplaceStrategies = ref<MarketplaceStrategy[]>([
  {
    id: 'mp-1',
    name: 'Aurora Momentum Grid',
    tradingStyle: 'High-frequency crypto momentum scalper',
    description: 'Targets micro-trends on Aster DEX with adaptive position sizing and trailing exits.',
    liveTrades: 187,
    winRate: 72.4,
    totalProfit: 42850,
    assetClasses: ['crypto', 'futures'],
    royalty: 12,
    trackedDuration: '9 months',
    trader: 'NovaQuant Labs',
    traderExperience: 'Quant fund, est. 2018',
    traderIcon: 'i-heroicons-sparkles',
    bio: 'NovaQuant specializes in cross-exchange arbitrage and high-frequency execution, running validator infrastructure since 2019.'
  },
  {
    id: 'mp-2',
    name: 'Atlas Macro Swing',
    tradingStyle: 'Macro swing trader focusing on FX & commodities',
    description: 'Combines OANDA FX positions with hedged futures exposure to ride macro cycles.',
    liveTrades: 64,
    winRate: 61.2,
    totalProfit: 18320,
    assetClasses: ['forex', 'futures'],
    royalty: 8,
    trackedDuration: '14 months',
    trader: 'Atlas Collective',
    traderExperience: 'Former buy-side macro desk',
    traderIcon: 'i-heroicons-globe-alt',
    bio: 'Team of ex-hedge fund macro traders, publishing weekly global macro notes and risk briefings.'
  },
  {
    id: 'mp-3',
    name: 'Theta Harvest Options',
    tradingStyle: 'Delta-neutral options income with Tradier',
    description: 'Focuses on weekly iron condors with dynamic hedging to capture time decay.',
    liveTrades: 42,
    winRate: 58.9,
    totalProfit: 9650,
    assetClasses: ['options', 'stocks'],
    royalty: 15,
    trackedDuration: '6 months',
    trader: 'Sierra Volatility Desk',
    traderExperience: 'Options educator & prop trader',
    traderIcon: 'i-heroicons-scale',
    bio: 'Sierra runs a private options lab teaching risk-defined structures and provides detailed playbooks for each campaign.'
  }
]);


// Form state
const strategyForm = ref({
  name: '',
  description: '',
  asset_class: null as string | null,
});

// Multi-select asset classes
const selectedAssetClasses = ref<string[]>([])

// Toggle asset class selection
function toggleAssetClass(value: string) {
  const index = selectedAssetClasses.value.indexOf(value)
  if (index > -1) {
    selectedAssetClasses.value.splice(index, 1)
  } else {
    selectedAssetClasses.value.push(value)
  }
  // Store as comma-separated string for database
  strategyForm.value.asset_class = selectedAssetClasses.value.length > 0 
    ? selectedAssetClasses.value.join(',') 
    : null
}

// Options
const assetClassOptions = [
  { label: 'Forex', value: 'forex' },
  { label: 'Crypto', value: 'crypto' },
  { label: 'Stocks', value: 'stocks' },
  { label: 'Options', value: 'options' },
  { label: 'Futures', value: 'futures' },
];



const toast = useToast()

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
    // Find the parent UCard element by traversing up the DOM
    let cardElement = (event.currentTarget as HTMLElement).closest('[data-strategy-id]') as HTMLElement;
    // Fallback: try to find any card-like container
    if (!cardElement) {
      cardElement = (event.currentTarget as HTMLElement).closest('.hover\\:shadow-xl, [class*="shadow"]') as HTMLElement;
    }
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
    toast.add({
      title: 'Pine Script required',
      description: 'Please enter Pine Script code before saving.',
      color: 'warning',
    });
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
      toast.add({
        title: 'Pine Script saved',
        description: 'Your Pine Script code has been saved successfully.',
        icon: 'i-heroicons-check-circle',
        color: 'success',
      });
    } else {
      toast.add({
        title: 'Failed to save Pine Script',
        description: 'Please check the console for details.',
        color: 'error',
      });
    }
  } catch (error) {
    console.error('Error saving Pine Script:', error);
    toast.add({
      title: 'Error saving Pine Script',
      description: 'Please make sure the database is set up correctly.',
      color: 'error',
    });
  } finally {
    saving.value = false;
  }
}

// Open Add Strategy (Inline Card)
function openAddStrategyModal() {
  editingStrategy.value = null;
  editingStrategyId.value = null;
  strategyForm.value = {
    name: '',
    description: '',
    asset_class: null,
  };
  selectedAssetClasses.value = [];
  showStrategyModal.value = true;
  // Force scroll to top immediately, then again after DOM update
  window.scrollTo({ top: 0, behavior: 'instant' });
  nextTick(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const addCard = document.querySelector('[data-add-strategy-card]');
      if (addCard) {
        addCard.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      }
    });
  });
}

// Cancel Add Strategy
function cancelAddStrategy() {
  showStrategyModal.value = false;
  strategyForm.value = {
    name: '',
    description: '',
    asset_class: null,
  };
  selectedAssetClasses.value = [];
}

// Start inline editing in card
function startEditStrategy(strategy: Strategy) {
  editingStrategy.value = strategy;
  editingStrategyId.value = strategy.id;
  strategyForm.value = {
    name: strategy.name,
    description: strategy.description || '',
    asset_class: strategy.asset_class,
  };
  // Parse asset classes from comma-separated string or single value
  if (strategy.asset_class) {
    selectedAssetClasses.value = strategy.asset_class.includes(',') 
      ? strategy.asset_class.split(',')
      : [strategy.asset_class];
  } else {
    selectedAssetClasses.value = [];
  }
  // Scroll to the card being edited
  nextTick(() => {
    const cardElement = document.querySelector(`[data-strategy-id="${strategy.id}"]`);
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

// Cancel inline editing
function cancelEdit() {
  editingStrategy.value = null;
  editingStrategyId.value = null;
  strategyForm.value = {
    name: '',
    description: '',
    asset_class: null,
  };
  selectedAssetClasses.value = [];
}

// Save Strategy (Create or Update)
async function saveStrategy() {
  if (!strategyForm.value.name) {
    toast.add({
      title: 'Strategy name required',
      description: 'Please enter a strategy name.',
      color: 'warning',
    });
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
      const wasEditing = !!editingStrategyId.value;
      const strategyName = strategyForm.value.name;
      showStrategyModal.value = false;
      // Clear editing state
      editingStrategy.value = null;
      editingStrategyId.value = null;
      await loadStrategies();
      toast.add({
        title: wasEditing ? 'Strategy updated' : 'Strategy created',
        description: `"${strategyName}" has been ${wasEditing ? 'updated' : 'created'} successfully.`,
        icon: 'i-heroicons-check-circle',
        color: 'success',
      });
    } else {
      toast.add({
        title: 'Failed to save strategy',
        description: 'Please check the console for details.',
        color: 'error',
      });
    }
  } catch (error) {
    console.error('Error saving strategy:', error);
    toast.add({
      title: 'Error saving strategy',
      description: 'Please make sure the database is set up correctly.',
      color: 'error',
    });
  } finally {
    saving.value = false;
  }
}

// Toggle Strategy Status
async function toggleStatus(id: string) {
  try {
    const strategy = strategies.value.find(s => s.id === id);
    const result = await toggleStrategyStatusAPI(id);
    if (result) {
      await loadStrategies();
      
      // Find the updated strategy to get its new status
      const updatedStrategy = strategies.value.find(s => s.id === id);
      const newStatus = updatedStrategy?.status || 'unknown';
      
      toast.add({
        title: 'Strategy status updated',
        description: `"${strategy?.name || 'Strategy'}" is now ${newStatus === 'active' ? 'active' : 'inactive'}.`,
        icon: 'i-heroicons-check-circle',
        color: 'success',
      });
      
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
    toast.add({
      title: 'Failed to update strategy status',
      description: 'Please check the console for details.',
      color: 'error',
    });
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
      toast.add({
        title: 'Strategy deleted',
        description: `"${strategy.name}" has been deleted successfully.`,
        icon: 'i-heroicons-check-circle',
        color: 'success',
      });
    } else {
      console.error('Delete strategy returned false. Check browser console for Supabase error details.');
      toast.add({
        title: 'Failed to delete strategy',
        description: 'Please check the browser console for details and ensure Row Level Security (RLS) is disabled or properly configured.',
        color: 'error',
      });
    }
  } catch (error) {
    console.error('Error deleting strategy:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    toast.add({
      title: 'Error deleting strategy',
      description: errorMessage || 'Please check the console for details and ensure database permissions are set correctly.',
      color: 'error',
    });
  }
}

function viewTraderBio(strategy: MarketplaceStrategy) {
  alert(`${strategy.trader} Bio:\n\n${strategy.bio}`);
}

function requestAccess(strategy: MarketplaceStrategy) {
  alert(`Request submitted for ${strategy.name}. We'll notify ${strategy.trader}. (Mock action)`);
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

// Watch editing state to restore scroll when cancelled
watch(editingStrategyId, (id) => {
  if (!id) {
    // No longer editing - ensure body scroll is restored
    document.body.style.overflow = '';
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
