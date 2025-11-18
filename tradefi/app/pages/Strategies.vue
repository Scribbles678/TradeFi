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
          class="w-full max-w-2xl mx-auto shadow-2xl border-2 border-green-500 dark:border-green-400 z-10 hover:shadow-xl transition-all duration-300"
        >
        <template #header>
          <div class="flex items-center justify-between py-2">
            <h3 class="text-base font-bold text-gray-900 dark:text-white">Add New Strategy</h3>
            <UButton
              icon="i-heroicons-x-mark"
              size="xs"
              variant="ghost"
              class="text-gray-400 hover:text-gray-600"
              @click="cancelAddStrategy()"
            />
          </div>
        </template>

        <form @submit.prevent="saveStrategy" class="space-y-3 px-1">
          <!-- Strategy Name -->
          <UFormField label="Strategy Name" class="mb-2">
            <UInput 
              v-model="strategyForm.name" 
              placeholder="e.g., Momentum Breakout Strategy"
              icon="i-heroicons-tag"
              autofocus
              required
              size="sm"
            />
          </UFormField>

          <!-- Description -->
          <UFormField label="Description" class="mb-2">
            <UTextarea
              v-model="strategyForm.description"
              placeholder="Describe your strategy's approach, entry/exit conditions, etc."
              :rows="2"
              size="sm"
            />
          </UFormField>

          <!-- Asset Class - Multi-select Pills -->
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-700 dark:text-gray-300">
              Asset Classes
            </label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="option in assetClassOptions"
                :key="option.value"
                type="button"
                :class="[
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200',
                  selectedAssetClasses.includes(option.value)
                    ? 'border-2 border-green-500 text-green-500 bg-transparent'
                    : 'border border-gray-600 text-gray-400 bg-transparent hover:border-gray-500'
                ]"
                @click="toggleAssetClass(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- Risk Controls -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t dark:border-gray-700">
            <UFormField label="Take Profit Target (%)" help="Percent gain that triggers profit-taking.">
              <UInput 
                v-model.number="strategyForm.take_profit_percent" 
                type="number" 
                min="0" 
                step="0.1" 
                placeholder="e.g. 2" 
                size="sm"
              />
            </UFormField>
            <UFormField label="Stop Loss Limit (%)" help="Percent drawdown where Sparky exits the trade.">
              <UInput 
                v-model.number="strategyForm.stop_loss_percent" 
                type="number" 
                min="0" 
                step="0.1" 
                placeholder="e.g. 1" 
                size="sm"
              />
            </UFormField>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row justify-end gap-2 pt-1">
            <UButton
              type="button"
              label="Cancel"
              size="sm"
              variant="ghost"
              class="w-full sm:w-auto text-gray-400 hover:text-gray-600"
              @click="cancelAddStrategy()"
            />
            <UButton
              type="submit"
              label="Create Strategy"
              size="sm"
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
              <!-- Asset Class Badge(s) -->
              <div v-if="getStrategyAssetClasses(strategy).length > 0" class="mt-2 flex flex-wrap gap-1">
                <UBadge 
                  v-for="assetClass in getStrategyAssetClasses(strategy)"
                  :key="assetClass"
                  color="neutral" 
                  variant="outline" 
                  size="xs"
                >
                  {{ assetClass.toUpperCase() }}
                </UBadge>
              </div>
            </div>
            <UBadge :color="getStatusColor(strategy.status)" size="sm">
              {{ strategy.status.toUpperCase() }}
            </UBadge>
          </div>
        </template>

        <!-- Edit Form -->
        <form v-if="editingStrategyId === strategy.id" @submit.prevent="saveStrategy()" class="space-y-3 px-1">
          <!-- Strategy Name -->
          <UFormField label="Strategy Name" class="mb-2">
            <UInput 
              v-model="strategyForm.name" 
              placeholder="e.g., Momentum Breakout Strategy"
              icon="i-heroicons-tag"
              autofocus
              required
              size="sm"
            />
          </UFormField>

          <!-- Description -->
          <UFormField label="Description" class="mb-2">
            <UTextarea
              v-model="strategyForm.description"
              placeholder="Describe your strategy's approach, entry/exit conditions, etc."
              :rows="2"
              size="sm"
            />
          </UFormField>

          <!-- Asset Class - Multi-select Pills -->
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-700 dark:text-gray-300">
              Asset Classes
            </label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="option in assetClassOptions"
                :key="option.value"
                type="button"
                :class="[
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200',
                  selectedAssetClasses.includes(option.value)
                    ? 'border-2 border-green-500 text-green-500 bg-transparent'
                    : 'border border-gray-600 text-gray-400 bg-transparent hover:border-gray-500'
                ]"
                @click="toggleAssetClass(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row justify-end gap-2 pt-1">
            <UButton
              type="button"
              label="Cancel"
              size="sm"
              variant="ghost"
              class="w-full sm:w-auto text-gray-400 hover:text-gray-600"
              @click="cancelEdit()"
            />
            <UButton
              type="submit"
              label="Save Changes"
              size="sm"
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
              <span class="text-gray-600 dark:text-gray-400 font-medium">Win Rate</span>
              <span 
                class="font-bold"
                :class="{
                  'text-green-400': calculateWinRate(strategy) >= 70,
                  'text-yellow-400': calculateWinRate(strategy) >= 50 && calculateWinRate(strategy) < 70,
                  'text-red-400': calculateWinRate(strategy) < 50,
                  'text-gray-400': strategy.total_trades === 0
                }"
              >
                {{ calculateWinRate(strategy).toFixed(1) }}%
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400 font-medium">Wins/Total</span>
              <span class="font-bold text-gray-900 dark:text-white">
                {{ strategy.winning_trades || 0 }}/{{ strategy.total_trades || 0 }} trades
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400 font-medium">Total P&L</span>
              <span 
                class="font-bold"
                :class="(strategyPnL[strategy.id] || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
              >
                {{ (strategyPnL[strategy.id] || 0) >= 0 ? '+' : '' }}${{ (strategyPnL[strategy.id] || 0).toFixed(2) }}
              </span>
            </div>
            <div class="pt-2 border-t dark:border-gray-700 space-y-2">
              <div class="flex items-center justify-between gap-2">
                <label class="text-xs text-gray-600 dark:text-gray-400 font-medium">Take Profit (%)</label>
                <UInput 
                  v-model.number="strategy.take_profit_percent" 
                  type="number" 
                  min="0" 
                  step="0.1" 
                  placeholder="e.g. 2"
                  size="xs"
                  class="w-24"
                  @blur="updateStrategyField(strategy, 'take_profit_percent')"
                />
              </div>
              <div class="flex items-center justify-between gap-2">
                <label class="text-xs text-gray-600 dark:text-gray-400 font-medium">Stop Loss (%)</label>
                <UInput 
                  v-model.number="strategy.stop_loss_percent" 
                  type="number" 
                  min="0" 
                  step="0.1" 
                  placeholder="e.g. 1"
                  size="xs"
                  class="w-24"
                  @blur="updateStrategyField(strategy, 'stop_loss_percent')"
                />
              </div>
            </div>
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

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import {
  getStrategies,
  createStrategy,
  updateStrategy,
  deleteStrategy as deleteStrategyAPI,
  toggleStrategyStatus as toggleStrategyStatusAPI,
  getStrategyPnL,
  type Strategy,
  type AssetClass
} from '~/utils/supabase';

// View toggle
const strategyViews = [
  { key: 'your' as const, label: 'Your Strategies' },
  { key: 'marketplace' as const, label: 'Marketplace Strategies' }
];

const strategyView = ref<'your' | 'marketplace'>('your');

// State
const strategies = ref<Strategy[]>([]);
const strategyPnL = ref<Record<string, number>>({});
const showStrategyModal = ref(false);
const editingStrategy = ref<Strategy | null>(null);
const editingStrategyId = ref<string | null>(null);
const saving = ref(false);

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
  take_profit_percent: null as number | null,
  stop_loss_percent: null as number | null,
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
  // Store first asset class in enum field (database constraint)
  // Full list will be stored in notes field
  strategyForm.value.asset_class = selectedAssetClasses.value.length > 0 
    ? selectedAssetClasses.value[0] as AssetClass
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
  
  // Load P&L for each strategy
  const pnlMap: Record<string, number> = {};
  await Promise.all(
    strategies.value.map(async (strategy) => {
      const pnl = await getStrategyPnL(strategy.id);
      pnlMap[strategy.id] = pnl;
    })
  );
  strategyPnL.value = pnlMap;
}

// Calculate win rate for a strategy
function calculateWinRate(strategy: Strategy): number {
  if (strategy.total_trades === 0) return 0;
  return (strategy.winning_trades / strategy.total_trades) * 100;
}

// Open Add Strategy (Inline Card)
function openAddStrategyModal() {
  editingStrategy.value = null;
  editingStrategyId.value = null;
  strategyForm.value = {
    name: '',
    description: '',
    asset_class: null,
    take_profit_percent: null,
    stop_loss_percent: null,
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
    take_profit_percent: null,
    stop_loss_percent: null,
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
    take_profit_percent: strategy.take_profit_percent || null,
    stop_loss_percent: strategy.stop_loss_percent || null,
  };
  // Parse asset classes from notes field (ASSET_CLASSES:crypto,stocks,options)
  // or fall back to single asset_class enum value
  selectedAssetClasses.value = [];
  if (strategy.notes) {
    const assetClassMatch = strategy.notes.match(/ASSET_CLASSES:([^\n]+)/);
    if (assetClassMatch && assetClassMatch[1]) {
      selectedAssetClasses.value = assetClassMatch[1].split(',').filter(Boolean);
    }
  }
  // Fallback: if no ASSET_CLASSES in notes, use the single enum value
  if (selectedAssetClasses.value.length === 0 && strategy.asset_class) {
    selectedAssetClasses.value = [strategy.asset_class];
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
    take_profit_percent: null,
    stop_loss_percent: null,
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
    // Prepare the data to save
    // Store first asset class in enum field, full list in notes
    const assetClassList = selectedAssetClasses.value.length > 0 
      ? selectedAssetClasses.value[0] as AssetClass 
      : '';
    
    // Preserve existing notes if editing, or create new notes with asset classes
    let notes = '';
    if (editingStrategy.value?.notes) {
      // Remove old ASSET_CLASSES entry if it exists
      notes = editingStrategy.value.notes.replace(/ASSET_CLASSES:[^\n]*/g, '').trim();
    }
    
    // Add ALL asset classes to notes in a parseable format (comma-separated)
    if (selectedAssetClasses.value.length > 0) {
      const assetClassesString = selectedAssetClasses.value.join(',');
      notes = notes ? `${notes}\nASSET_CLASSES:${assetClassesString}` : `ASSET_CLASSES:${assetClassesString}`;
    }
    
    // Ensure asset_class is always a single value (not comma-separated)
    // Extract first asset class from selectedAssetClasses array and validate it
    let singleAssetClass: AssetClass | null = null;
    if (selectedAssetClasses.value.length > 0) {
      const firstClass = selectedAssetClasses.value[0];
      if (firstClass) {
        // Validate it's a valid AssetClass enum value (not a comma-separated string)
        const validAssetClasses: AssetClass[] = ['forex', 'crypto', 'options', 'stocks', 'futures'];
        if (validAssetClasses.includes(firstClass as AssetClass) && !firstClass.includes(',')) {
          singleAssetClass = firstClass as AssetClass;
        } else {
          console.warn('Invalid asset class value detected:', firstClass);
          // Fallback: try to extract first valid class from the string
          const firstValid = validAssetClasses.find(ac => firstClass.includes(ac));
          singleAssetClass = firstValid || null;
        }
      }
    }
    
    const dataToSave = {
      name: strategyForm.value.name,
      description: strategyForm.value.description || null,
      asset_class: singleAssetClass,  // Always a single enum value or null
      notes: notes || null,
      take_profit_percent: strategyForm.value.take_profit_percent || null,
      stop_loss_percent: strategyForm.value.stop_loss_percent || null,
    };
    
    // Debug log to verify we're sending the correct format
    console.log('Saving strategy with asset_class:', singleAssetClass, 'selectedAssetClasses:', selectedAssetClasses.value);
    
    let result;
    if (editingStrategy.value) {
      // Update existing strategy
      result = await updateStrategy(editingStrategy.value.id, dataToSave);
    } else {
      // Create new strategy
      result = await createStrategy({
        ...dataToSave,
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

// Update a single field on a strategy (for inline editing)
async function updateStrategyField(strategy: Strategy, field: 'take_profit_percent' | 'stop_loss_percent') {
  try {
    const updateData = {
      [field]: strategy[field] || null,
    };
    
    const result = await updateStrategy(strategy.id, updateData);
    
    if (result) {
      toast.add({
        title: 'Updated',
        description: `${field === 'take_profit_percent' ? 'Take Profit' : 'Stop Loss'} updated successfully.`,
        icon: 'i-heroicons-check-circle',
        color: 'success',
      });
    }
  } catch (error) {
    console.error(`Error updating ${field}:`, error);
    toast.add({
      title: 'Update failed',
      description: `Failed to update ${field === 'take_profit_percent' ? 'Take Profit' : 'Stop Loss'}.`,
      color: 'error',
    });
    // Reload to revert the change
    await loadStrategies();
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

// Helper function to extract asset classes from strategy
function getStrategyAssetClasses(strategy: Strategy): string[] {
  // First try to parse from notes field (ASSET_CLASSES:crypto,stocks,options)
  if (strategy.notes) {
    const assetClassMatch = strategy.notes.match(/ASSET_CLASSES:([^\n]+)/);
    if (assetClassMatch && assetClassMatch[1]) {
      return assetClassMatch[1].split(',').filter(Boolean);
    }
  }
  // Fallback: use single asset_class enum value
  if (strategy.asset_class) {
    return [strategy.asset_class];
  }
  return [];
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

<style scoped>
/* Asset Class Pills - Green Border Effect (matching form field focus) */
/* Using native button elements now, so simpler styling */
button[type="button"].border-green-500:hover {
  border-color: #34d399 !important; /* green-400 - lighter green on hover */
  color: #34d399 !important;
  background-color: rgba(16, 185, 129, 0.1) !important;
  transform: translateY(-1px);
}

button[type="button"]:not(.border-green-500):hover {
  border-color: rgba(107, 114, 128, 0.8) !important;
  transform: translateY(-1px);
}
</style>
