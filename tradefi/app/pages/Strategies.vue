<template>
  <div class="space-y-8 p-6">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-foreground">Trading Strategies</h1>
        <p class="text-muted-foreground text-sm mt-1">
          Manage your own strategies or explore the marketplace
        </p>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <div class="inline-flex items-center rounded-lg border bg-card p-1">
          <Button
            v-for="view in strategyViews"
            :key="view.key"
            @click="strategyView = view.key"
            :variant="strategyView === view.key ? 'default' : 'ghost'"
            size="sm"
          >
            {{ view.label }}
          </Button>
        </div>
        <Button
          v-if="strategyView === 'your'"
          size="sm"
          @click="openAddStrategyModal"
        >
          <Icon name="i-heroicons-plus" class="w-4 h-4 mr-1" />
          Add Strategy
        </Button>
      </div>
    </div>

    <!-- Marketplace Banner -->
    <Card v-if="strategyView === 'marketplace'" class="border-blue-500/20 bg-blue-500/5">
      <CardContent class="flex gap-3 py-4">
        <Icon name="i-heroicons-megaphone" class="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p class="font-semibold text-foreground mb-1">Marketplace Strategies (Alpha)</p>
          <p class="text-sm text-muted-foreground">Discover entrepreneurs offering their automated alerts for a revenue share. Due diligence recommended before subscribing.</p>
        </div>
      </CardContent>
    </Card>

    <!-- Strategy List Section -->
    <div v-if="strategyView === 'your'" class="space-y-6">
      <!-- Add New Strategy Card (At Top - Always First) -->
      <Transition name="fade">
        <Card
          v-if="showStrategyModal && !editingStrategyId"
          key="add-strategy-card"
          data-add-strategy-card
          class="w-full max-w-2xl mx-auto border-2 border-green-500 z-10"
        >
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>Add New Strategy</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              @click="cancelAddStrategy()"
            >
              <Icon name="i-heroicons-x-mark" class="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>

        <form @submit.prevent="saveStrategy" class="space-y-3 px-1">
          <!-- Strategy Name -->
          <div class="space-y-2 mb-2">
            <Label for="strategy-name">Strategy Name</Label>
            <Input 
              id="strategy-name"
              v-model="strategyForm.name" 
              placeholder="e.g., Momentum Breakout Strategy"
              autofocus
              required
            />
          </div>

          <!-- Description -->
          <div class="space-y-2 mb-2">
            <Label for="strategy-description">Description</Label>
            <UTextarea
              id="strategy-description"
              v-model="strategyForm.description"
              placeholder="Describe your strategy's approach, entry/exit conditions, etc."
              :rows="2"
              size="sm"
            />
          </div>

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
            <div class="space-y-2">
              <Label for="take-profit">Take Profit Target (%)</Label>
              <Input 
                id="take-profit"
                v-model.number="strategyForm.take_profit_percent" 
                type="number" 
                min="0" 
                step="0.1" 
                placeholder="e.g. 2"
              />
              <p class="text-xs text-muted-foreground">Percent gain that triggers profit-taking.</p>
            </div>
            <div class="space-y-2">
              <Label for="stop-loss">Stop Loss Limit (%)</Label>
              <Input 
                id="stop-loss"
                v-model.number="strategyForm.stop_loss_percent" 
                type="number" 
                min="0" 
                step="0.1" 
                placeholder="e.g. 1"
              />
              <p class="text-xs text-muted-foreground">Percent drawdown where Sparky exits the trade.</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="w-full sm:w-auto"
              @click="cancelAddStrategy()"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              class="w-full sm:w-auto"
              :disabled="saving"
            >
              <Icon name="i-heroicons-check" class="w-4 h-4 mr-1" />
              Create Strategy
            </Button>
          </div>
        </form>
        </CardContent>
        </Card>
      </Transition>

      <!-- Existing Strategy Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          v-for="strategy in strategies"
          :key="strategy.id"
          :data-strategy-id="strategy.id"
          :class="[
            editingStrategyId === strategy.id 
              ? 'md:col-span-2 lg:col-span-3 border-2 border-blue-500 z-10' 
              : ''
          ]"
        >
        <CardHeader>
          <!-- Edit Mode Header -->
          <div v-if="editingStrategyId === strategy.id">
            <div class="flex items-center justify-between">
              <CardTitle>Edit Strategy</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                @click="cancelEdit()"
              >
                <Icon name="i-heroicons-x-mark" class="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <!-- View Mode Header -->
          <div v-else class="flex items-start justify-between gap-3">
            <div class="flex-1">
              <CardTitle>{{ strategy.name }}</CardTitle>
              <!-- Asset Class Badge(s) -->
              <div v-if="getStrategyAssetClasses(strategy).length > 0" class="mt-2 flex flex-wrap gap-1">
                <Badge 
                  v-for="assetClass in getStrategyAssetClasses(strategy)"
                  :key="assetClass"
                  variant="outline" 
                  class="text-xs"
                >
                  {{ assetClass.toUpperCase() }}
                </Badge>
              </div>
            </div>
            <Badge :variant="getStatusColor(strategy.status) === 'success' ? 'success' : getStatusColor(strategy.status) === 'warning' ? 'pending' : 'outline'" class="text-xs">
              {{ strategy.status.toUpperCase() }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>

        <!-- Edit Form -->
        <form v-if="editingStrategyId === strategy.id" @submit.prevent="saveStrategy()" class="space-y-3 px-1">
          <!-- Strategy Name -->
          <div class="space-y-2 mb-2">
            <Label for="edit-strategy-name">Strategy Name</Label>
            <Input 
              id="edit-strategy-name"
              v-model="strategyForm.name" 
              placeholder="e.g., Momentum Breakout Strategy"
              autofocus
              required
            />
          </div>

          <!-- Description -->
          <div class="space-y-2 mb-2">
            <Label for="edit-strategy-description">Description</Label>
            <UTextarea
              id="edit-strategy-description"
              v-model="strategyForm.description"
              placeholder="Describe your strategy's approach, entry/exit conditions, etc."
              :rows="2"
              size="sm"
            />
          </div>

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
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="w-full sm:w-auto"
              @click="cancelEdit()"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              class="w-full sm:w-auto"
              :disabled="saving"
            >
              <Icon name="i-heroicons-check" class="w-4 h-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </form>

        <!-- View Mode Content -->
        <div v-else class="space-y-4">
          <!-- Description -->
          <p class="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">
            {{ strategy.description || 'No description provided for this strategy.' }}
          </p>

          <!-- Performance Metrics -->
          <div class="rounded-lg border bg-card p-3 space-y-2.5">
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground font-medium">Win Rate</span>
              <span 
                class="font-bold"
                :class="{
                  'text-green-400': calculateWinRate(strategy) >= 70,
                  'text-yellow-400': calculateWinRate(strategy) >= 50 && calculateWinRate(strategy) < 70,
                  'text-red-400': calculateWinRate(strategy) < 50,
                  'text-muted-foreground': strategy.total_trades === 0
                }"
              >
                {{ calculateWinRate(strategy).toFixed(1) }}%
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground font-medium">Wins/Total</span>
              <span class="font-bold text-foreground">
                {{ strategy.winning_trades || 0 }}/{{ strategy.total_trades || 0 }} trades
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground font-medium">Total P&L</span>
              <span 
                class="font-bold"
                :class="(strategyPnL[strategy.id] || 0) >= 0 ? 'text-green-400' : 'text-red-400'"
              >
                {{ (strategyPnL[strategy.id] || 0) >= 0 ? '+' : '' }}${{ (strategyPnL[strategy.id] || 0).toFixed(2) }}
              </span>
            </div>
            <div class="pt-2 border-t border-border space-y-2">
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
              
              <!-- Trailing Stop Loss Section -->
              <div class="pt-2 border-t border-border space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <label class="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                    <Icon name="i-heroicons-arrow-trending-up" class="w-3 h-3" />
                    Trailing Stop Loss
                  </label>
                  <button
                    @click="toggleTrailingStopLoss(strategy.id)"
                    :class="[
                      'px-2 py-1 text-xs font-semibold rounded transition-all duration-200',
                      trailingStopLoss[strategy.id]?.enabled
                        ? 'bg-gray-900 dark:bg-gray-950 text-green-400 border-2 border-green-400'
                        : 'bg-gray-800 dark:bg-gray-800 text-gray-400 border border-gray-600 hover:border-gray-500'
                    ]"
                  >
                    {{ trailingStopLoss[strategy.id]?.enabled ? 'ON' : 'OFF' }}
                  </button>
                </div>
                
                <!-- Trailing Stop Loss Input (shown when enabled) -->
                <div v-if="trailingStopLoss[strategy.id]?.enabled" class="flex items-center justify-between gap-2 pl-4">
                  <label class="text-xs text-gray-500 dark:text-gray-500 font-medium">Trail Distance (%)</label>
                  <UInput 
                    v-model.number="trailingStopLoss[strategy.id].trailPercent" 
                    type="number" 
                    min="0" 
                    step="0.1" 
                    placeholder="e.g. 0.5"
                    size="xs"
                    class="w-24"
                  />
                </div>
                
                <!-- Info text -->
                <p v-if="trailingStopLoss[strategy.id]?.enabled" class="text-xs text-muted-foreground pl-4">
                  Stop loss will trail price by {{ trailingStopLoss[strategy.id].trailPercent || 0 }}% as it moves in your favor
                </p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="grid grid-cols-3 gap-2 pt-4 border-t border-border">
            <!-- Toggle Status Button -->
            <Button
              :variant="strategy.status === 'active' ? 'destructive' : 'default'"
              size="sm"
              class="w-full"
              @click="toggleStatus(strategy.id)"
            >
              <Icon :name="strategy.status === 'active' ? 'i-heroicons-pause' : 'i-heroicons-play'" class="w-4 h-4" />
              <span class="ml-1 hidden xl:inline">{{ strategy.status === 'active' ? 'Pause' : 'Activate' }}</span>
            </Button>
            
            <!-- Edit Button -->
            <Button
              variant="outline"
              size="sm"
              class="w-full"
              @click="startEditStrategy(strategy)"
            >
              <Icon name="i-heroicons-pencil" class="w-4 h-4" />
              <span class="ml-1 hidden xl:inline">Edit</span>
            </Button>
            
            <!-- Delete Button -->
            <Button
              variant="destructive"
              size="sm"
              class="w-full"
              @click="deleteStrategyConfirm(strategy)"
            >
              <Icon name="i-heroicons-trash" class="w-4 h-4" />
              <span class="ml-1 hidden xl:inline">Delete</span>
            </Button>
          </div>
        </div>
        </CardContent>
        </Card>
      </div>

      <!-- Empty State -->
      <Card v-if="strategies.length === 0 && !showStrategyModal" class="w-full">
        <CardContent class="text-center py-12">
          <Icon name="i-heroicons-chart-bar" class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p class="text-muted-foreground">No strategies yet</p>
          <Button
            size="lg"
            class="mt-4"
            @click="openAddStrategyModal"
          >
            Add Your First Strategy
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- Marketplace Strategies -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <Card
        v-for="strategy in marketplaceStrategies"
        :key="strategy.id"
        class="border-yellow-500/20"
      >
        <CardHeader>
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <Icon :name="strategy.traderIcon" class="w-5 h-5 text-yellow-400" />
                <span class="text-xs text-yellow-400 font-semibold uppercase tracking-wide">
                  Featured Trader
                </span>
              </div>
              <CardTitle class="mt-1">{{ strategy.name }}</CardTitle>
              <p class="text-sm text-muted-foreground">{{ strategy.tradingStyle }}</p>
            </div>
            <div class="text-right space-y-1">
              <Badge variant="success" class="text-xs">{{ strategy.royalty }}% Royalty</Badge>
              <p class="text-xs text-muted-foreground">Tracked {{ strategy.trackedDuration }}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-foreground mb-4">
            {{ strategy.description }}
          </p>

          <div class="grid grid-cols-2 gap-4 text-sm mb-4">
            <div class="rounded-lg border bg-card p-3">
              <p class="text-xs text-muted-foreground">Live Trades</p>
              <p class="text-xl font-bold text-foreground">{{ strategy.liveTrades }}</p>
            </div>
            <div class="rounded-lg border bg-card p-3">
              <p class="text-xs text-muted-foreground">Win Rate</p>
              <p class="text-xl font-bold text-green-400">{{ strategy.winRate }}%</p>
            </div>
            <div class="rounded-lg border bg-card p-3">
              <p class="text-xs text-muted-foreground">Total Profit</p>
              <p
                class="text-xl font-bold"
                :class="strategy.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'"
              >
                {{ strategy.totalProfit >= 0 ? '+' : '' }}${{ strategy.totalProfit.toLocaleString() }}
              </p>
            </div>
            <div class="rounded-lg border bg-card p-3">
              <p class="text-xs text-muted-foreground">Tracked Length</p>
              <p class="text-xl font-bold text-foreground">{{ strategy.trackedDuration }}</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 pt-2 border-t border-border mb-4">
            <Badge
              v-for="asset in strategy.assetClasses"
              :key="asset"
              variant="outline"
              class="text-xs"
            >
              {{ asset.toUpperCase() }}
            </Badge>
          </div>

          <div class="flex flex-col gap-2 pt-3">
            <div class="flex items-center gap-2">
              <Icon name="i-heroicons-user-circle" class="w-5 h-5 text-muted-foreground" />
              <div>
                <p class="text-sm font-semibold text-foreground">{{ strategy.trader }}</p>
                <p class="text-xs text-muted-foreground">{{ strategy.traderExperience }}</p>
              </div>
            </div>
            <div class="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                @click="viewTraderBio(strategy)"
              >
                View Trader Bio
              </Button>
              <Button
                size="sm"
                class="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                @click="requestAccess(strategy)"
              >
                <Icon name="i-heroicons-bolt" class="w-4 h-4 mr-1" />
                Request Access
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
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

// Trailing Stop Loss State (mock data for now)
const trailingStopLoss = ref<Record<string, { enabled: boolean; trailPercent: number }>>({});

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
      
      // Initialize trailing stop loss state (mock data for now)
      if (!trailingStopLoss.value[strategy.id]) {
        trailingStopLoss.value[strategy.id] = {
          enabled: false,
          trailPercent: 0.5
        };
      }
    })
  );
  strategyPnL.value = pnlMap;
}

// Toggle Trailing Stop Loss
function toggleTrailingStopLoss(strategyId: string) {
  if (!trailingStopLoss.value[strategyId]) {
    trailingStopLoss.value[strategyId] = {
      enabled: true,
      trailPercent: 0.5
    };
  } else {
    trailingStopLoss.value[strategyId].enabled = !trailingStopLoss.value[strategyId].enabled;
  }
  
  // Show toast notification
  const strategy = strategies.value.find(s => s.id === strategyId);
  toast.add({
    title: trailingStopLoss.value[strategyId].enabled ? 'Trailing Stop Loss Enabled' : 'Trailing Stop Loss Disabled',
    description: `"${strategy?.name || 'Strategy'}" is now using ${trailingStopLoss.value[strategyId].enabled ? 'trailing' : 'fixed'} stop loss.`,
    icon: 'i-heroicons-check-circle',
    color: trailingStopLoss.value[strategyId].enabled ? 'success' : 'neutral',
  });
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
