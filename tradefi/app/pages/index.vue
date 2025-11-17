<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Dashboard Overview</h1>
        <p class="text-gray-300 text-lg mt-1">Real-time analytics across all trading bots</p>
      </div>
      <UBadge :color="isConnected ? 'success' : 'error'" size="lg">
        {{ isConnected ? 'Connected' : 'Disconnected' }}
      </UBadge>
    </div>

    <!-- Asset Class Filter -->
    <div class="flex gap-2 flex-wrap">
      <UButton
        v-for="asset in assetClasses"
        :key="asset.value"
        @click="selectAssetClass(asset.value)"
        size="md"
        :class="[
          'font-semibold py-3 px-4 min-w-[100px] transition-all duration-200',
          selectedAssetClass === asset.value 
            ? 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 border border-blue-500/30' 
            : 'bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white border border-gray-500/30'
        ]"
      >
        <span class="text-base font-bold">{{ asset.label }}</span>
      </UButton>
    </div>

    <!-- Real-Time Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Total Portfolio -->
      <UCard class="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-500/20 shadow-lg shadow-blue-500/10">
        <div class="text-center space-y-6 h-full flex flex-col justify-center">
          <div class="flex items-center justify-center gap-2">
            <UIcon name="i-heroicons-currency-dollar" class="w-5 h-5 text-blue-400" />
            <p class="text-sm text-blue-300 font-medium">Total Portfolio</p>
          </div>
          
          <div>
            <p class="text-4xl font-bold text-white">
              <span v-if="isLoading" class="animate-pulse">Loading...</span>
              <span v-else>${{ totalBalance.toFixed(2) }}</span>
            </p>
            <p class="text-base text-blue-200/70 mt-3">{{ portfolioDescription }}</p>
          </div>
          
        </div>
      </UCard>

      <!-- P&L Card -->
      <UCard class="bg-gradient-to-br from-green-900/20 to-emerald-800/10 border border-green-500/20 shadow-lg shadow-green-500/10">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-green-400" />
              <p class="text-sm text-green-300 font-medium">P&L</p>
            </div>
            <div class="flex gap-2">
              <UButton
                size="sm"
                @click="pnlView = 'realized'"
                :class="[
                  'font-medium transition-all',
                  pnlView === 'realized'
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                ]"
              >
                Realized
              </UButton>
              <UButton
                size="sm"
                @click="pnlView = 'unrealized'"
                :class="[
                  'font-medium transition-all',
                  pnlView === 'unrealized'
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                ]"
              >
                Unrealized
              </UButton>
            </div>
          </div>
        </template>
        <div class="text-center space-y-4">
          <!-- Realized P&L View -->
          <div v-if="pnlView === 'realized'">
            <div>
              <p class="text-xs text-green-200/70 mb-1">Today's Realized P&L</p>
              <p :class="[
                'text-3xl font-bold',
                isLoading ? 'text-gray-400' : (todaysStats.todayPnL >= 0 ? 'text-green-400' : 'text-red-400')
              ]">
                <span v-if="isLoading" class="animate-pulse">Loading...</span>
                <span v-else>{{ todaysStats.todayPnL >= 0 ? '+' : '' }}${{ todaysStats.todayPnL.toFixed(2) }}</span>
              </p>
            </div>
            
            <div>
              <div class="flex items-center justify-center gap-2 mb-2">
                <UIcon name="i-heroicons-star" class="w-4 h-4 text-green-400" />
                <p class="text-sm text-green-300 font-medium">Win Rate</p>
              </div>
              <div 
                v-if="isLoading"
                class="text-3xl font-bold text-gray-400 animate-pulse"
              >
                Loading...
              </div>
              <div 
                v-else
                class="text-3xl font-bold"
                :class="{
                  'text-green-400': todaysStats.winRate >= 70,
                  'text-yellow-400': todaysStats.winRate >= 50 && todaysStats.winRate < 70,
                  'text-red-400': todaysStats.winRate < 50,
                  'text-gray-400': todaysStats.totalTrades === 0
                }"
              >
                {{ todaysStats.winRate.toFixed(1) }}%
              </div>
              <div class="text-sm text-green-200/70 mt-1">
                {{ Math.round(todaysStats.totalTrades * todaysStats.winRate / 100) }}/{{ todaysStats.totalTrades }} trades
              </div>
            </div>
          </div>
          
          <!-- Unrealized P&L View -->
          <div v-else-if="pnlView === 'unrealized'">
            <div>
              <p class="text-xs text-green-200/70 mb-1">Current Unrealized P&L</p>
              <p :class="[
                'text-3xl font-bold',
                isLoading ? 'text-gray-400' : (totalUnrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400')
              ]">
                <span v-if="isLoading" class="animate-pulse">Loading...</span>
                <span v-else>{{ totalUnrealizedPnl >= 0 ? '+' : '' }}${{ totalUnrealizedPnl.toFixed(2) }}</span>
              </p>
            </div>
            
            <div>
              <div class="flex items-center justify-center gap-2 mb-2">
                <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4 text-green-400" />
                <p class="text-sm text-green-300 font-medium">Open Positions</p>
              </div>
              <div 
                v-if="isLoading"
                class="text-3xl font-bold text-gray-400 animate-pulse"
              >
                Loading...
              </div>
              <div 
                v-else
                class="text-3xl font-bold text-white"
              >
                {{ filteredOpenPositions.length }}
              </div>
              <div class="text-sm text-green-200/70 mt-1">
                {{ filteredOpenPositions.length === 1 ? 'position' : 'positions' }}
              </div>
            </div>
            
            <div>
              <div class="flex items-center justify-center gap-2 mb-2">
                <UIcon name="i-heroicons-chart-bar-square" class="w-4 h-4 text-green-400" />
                <p class="text-sm text-green-300 font-medium">Avg P&L %</p>
              </div>
              <div 
                v-if="isLoading"
                class="text-2xl font-bold text-gray-400 animate-pulse"
              >
                Loading...
              </div>
              <div 
                v-else-if="filteredOpenPositions.length === 0"
                class="text-2xl font-bold text-gray-400"
              >
                N/A
              </div>
              <div 
                v-else
                class="text-2xl font-bold"
                :class="{
                  'text-green-400': averageUnrealizedPnlPercent >= 0,
                  'text-red-400': averageUnrealizedPnlPercent < 0
                }"
              >
                {{ averageUnrealizedPnlPercent >= 0 ? '+' : '' }}{{ averageUnrealizedPnlPercent.toFixed(2) }}%
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Open Positions -->
      <UCard class="bg-gradient-to-br from-orange-900/20 to-amber-800/10 border border-orange-500/20 shadow-lg shadow-orange-500/10">
        <div class="text-center space-y-4">
          <div class="flex items-center justify-center gap-2">
            <UIcon name="i-heroicons-shopping-cart" class="w-5 h-5 text-orange-400" />
            <p class="text-sm text-orange-300 font-medium">Open Positions</p>
          </div>
          
          <div>
            <p class="text-4xl font-bold text-white">{{ filteredOpenPositions.length }}</p>
            <p class="text-sm text-orange-200/70 mt-1">Active Positions</p>
          </div>
          
          <div>
            <p class="text-lg font-semibold text-orange-300">{{ todaysStats.totalTrades }}</p>
            <p class="text-sm text-orange-200/70">Today's Trades</p>
          </div>
          
        </div>
      </UCard>
    </div>


    <!-- P&L Chart and Recent Trades Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- P&L Chart -->
      <UCard class="bg-gradient-to-br from-cyan-900/20 to-blue-800/10 border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-cyan-300">Cumulative P&L</h3>
            <div class="flex gap-2">
              <UButton
                size="sm"
                @click="chartDays = 7; loadChartData()"
                :class="[
                  'font-medium',
                  chartDays === 7 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                ]"
              >
                7D
              </UButton>
              <UButton
                size="sm"
                @click="chartDays = 30; loadChartData()"
                :class="[
                  'font-medium',
                  chartDays === 30 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                ]"
              >
                30D
              </UButton>
              <UButton
                size="sm"
                @click="syncTrades"
                :disabled="isSyncingTrades"
                :class="[
                  'font-medium',
                  isSyncingTrades
                    ? 'bg-gray-500 cursor-not-allowed text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                ]"
              >
                <span v-if="isSyncingTrades">Syncing...</span>
                <span v-else>Sync Trades</span>
              </UButton>
            </div>
          </div>
        </template>
        <div class="h-64" ref="chartContainer">
          <!-- Chart will be rendered here -->
          <canvas ref="pnlChart"></canvas>
        </div>
      </UCard>

      <!-- Recent Trades / Open Trades -->
      <UCard class="bg-gradient-to-br from-indigo-900/20 to-purple-800/10 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-indigo-300">Trades</h3>
            <div class="flex gap-2">
              <UButton
                size="sm"
                @click="tradeView = 'recent'"
                :class="[
                  'font-medium transition-all',
                  tradeView === 'recent'
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                ]"
              >
                Recent Trades
              </UButton>
              <UButton
                size="sm"
                @click="tradeView = 'open'"
                :class="[
                  'font-medium transition-all',
                  tradeView === 'open'
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                ]"
              >
                Open Trades
              </UButton>
            </div>
          </div>
        </template>
        
        <!-- Recent Trades View -->
        <div v-if="tradeView === 'recent'" class="space-y-2 max-h-72 overflow-y-auto">
          <div v-if="isLoading" class="text-center py-8 text-gray-500">
            <div class="animate-pulse">Loading trades...</div>
          </div>
          <div
            v-else-if="recentTrades.length > 0"
            v-for="trade in recentTrades"
            :key="trade.id"
            class="flex items-center justify-between p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm hover:bg-indigo-500/20 transition-colors"
          >
            <div class="flex items-center gap-3">
              <UBadge :color="trade.side === 'BUY' ? 'success' : 'error'" size="xs">
                {{ trade.side }}
              </UBadge>
              <span class="font-mono font-semibold">{{ trade.symbol }}</span>
              <UBadge v-if="trade.asset_class || trade.exchange" size="xs" color="neutral">
                {{ getAssetClassLabel(trade.asset_class, trade.exchange) }}
              </UBadge>
              <span class="text-sm text-gray-500">
                {{ formatTime(trade.exit_time) }}
              </span>
            </div>
            <div class="text-right">
              <div :class="[
                'font-mono font-semibold',
                trade.is_winner ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              ]">
                {{ trade.pnl_usd >= 0 ? '+' : '' }}${{ trade.pnl_usd.toFixed(2) }}
              </div>
              <div class="text-xs text-gray-500">
                {{ trade.pnl_percent.toFixed(2) }}%
              </div>
            </div>
          </div>
          <div v-else-if="recentTrades.length === 0" class="text-center py-8 text-gray-500">
            No trades yet
          </div>
        </div>

        <!-- Open Trades View -->
        <div v-else-if="tradeView === 'open'" class="space-y-3 max-h-96 overflow-y-auto">
          <div v-if="isLoading" class="text-center py-8 text-gray-500">
            <div class="animate-pulse">Loading positions...</div>
          </div>
          <template v-else-if="filteredOpenPositions.length > 0">
            <div
              v-for="position in filteredOpenPositions"
              :key="position.id"
              class="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm hover:bg-indigo-500/20 transition-colors"
            >
              <!-- Header Row -->
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <UBadge :color="position.side === 'BUY' ? 'success' : 'error'" size="sm">
                    {{ position.side }}
                  </UBadge>
                  <span class="font-mono font-bold text-lg">{{ position.symbol }}</span>
                  <UBadge v-if="position.asset_class || position.exchange" size="xs" color="neutral">
                    {{ getAssetClassLabel(position.asset_class, position.exchange) }}
                  </UBadge>
                </div>
                <div class="text-right">
                  <div :class="[
                    'font-mono font-bold text-lg',
                    (position.unrealized_pnl_usd ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  ]">
                    {{ (position.unrealized_pnl_usd ?? 0) >= 0 ? '+' : '' }}${{ (position.unrealized_pnl_usd ?? 0).toFixed(2) }}
                  </div>
                  <div :class="[
                    'text-sm font-semibold',
                    (position.unrealized_pnl_percent ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  ]">
                    {{ (position.unrealized_pnl_percent ?? 0) >= 0 ? '+' : '' }}{{ (position.unrealized_pnl_percent ?? 0).toFixed(2) }}%
                  </div>
                </div>
              </div>

              <!-- Details Grid -->
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-400">Entry Price:</span>
                    <span class="font-semibold text-white">${{ (position.entry_price || 0).toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">Current Price:</span>
                    <span class="font-semibold text-white">${{ (position.current_price || position.entry_price || 0).toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">Quantity:</span>
                    <span class="font-semibold text-white">{{ (position.quantity || 0).toFixed(4) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">Position Size:</span>
                    <span class="font-semibold text-white">${{ (position.position_size_usd || 0).toFixed(2) }}</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-400">Time Open:</span>
                    <span class="font-semibold text-white">{{ formatDuration(position.entry_time) }}</span>
                  </div>
                  <div v-if="position.stop_loss_price != null" class="flex justify-between">
                    <span class="text-gray-400">Stop Loss:</span>
                    <span class="font-semibold text-red-400">${{ position.stop_loss_price.toFixed(2) }}</span>
                  </div>
                  <div v-if="position.take_profit_price != null" class="flex justify-between">
                    <span class="text-gray-400">Take Profit:</span>
                    <span class="font-semibold text-green-400">${{ position.take_profit_price.toFixed(2) }}</span>
                  </div>
                  <div v-if="position.stop_loss_percent != null || position.take_profit_percent != null" class="flex justify-between">
                    <span class="text-gray-400">Risk/Reward:</span>
                    <span class="font-semibold text-white">
                      {{ position.stop_loss_percent != null ? `-${position.stop_loss_percent}%` : 'N/A' }} / 
                      {{ position.take_profit_percent != null ? `+${position.take_profit_percent}%` : 'N/A' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <div v-else class="text-center py-8 text-gray-500">
            No open positions
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {
  getOpenPositions,
  getRecentTrades,
  getTodaysStats,
  getCumulativePnL,
  type Position,
  type Trade,
  type AssetClass
} from '~/utils/supabase';
import Chart from 'chart.js/auto';

// Asset Classes
const assetClasses = [
  { label: 'All', value: 'all' as const, exchange: 'All Exchanges' },
  { label: 'Forex', value: 'forex' as const, exchange: 'OANDA' },
  { label: 'Crypto', value: 'crypto' as const, exchange: 'Aster DEX' },
  { label: 'Stocks', value: 'stocks' as const, exchange: 'Tradier' },
  { label: 'Options', value: 'options' as const, exchange: 'Tradier' },
  { label: 'Futures', value: 'futures' as const, exchange: 'Tasty Trade' },
];

// State
const isConnected = ref(true);
const selectedAssetClass = ref<'all' | AssetClass>('all');
const isLoading = ref(false);
const openPositions = ref<Position[]>([]);
const recentTrades = ref<Trade[]>([]);
const todaysStats = ref({
  todayPnL: 0,
  winRate: 0,
  totalTrades: 0,
});
const chartDays = ref(7);
const pnlChart = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;
const totalBalance = ref(0);
const toast = useToast()

const tradeView = ref<'recent' | 'open'>('recent');
const pnlView = ref<'realized' | 'unrealized'>('realized');
const isSyncingTrades = ref(false);

// Computed property for portfolio description
const portfolioDescription = computed(() => {
  switch (selectedAssetClass.value) {
    case 'forex': return 'OANDA Forex only';
    case 'crypto': return 'Aster DEX Crypto only';
    case 'stocks': return 'Tradier Stocks only';
    case 'options': return 'Tradier Options only';
    case 'futures': return 'Tasty Trade Futures only';
    default: return 'Across all exchanges';
  }
});

// Computed property for filtered open positions (based on asset class filter)
const filteredOpenPositions = computed(() => {
  if (selectedAssetClass.value === 'all') {
    return openPositions.value;
  }
  return openPositions.value.filter(pos => {
    // Match by asset class
    if (pos.asset_class === selectedAssetClass.value) {
      return true;
    }
    // Fallback to exchange mapping if asset_class doesn't match
    const exchangeMapping: Record<string, string> = {
      'forex': 'oanda',
      'crypto': 'aster',
      'stocks': 'tradier',
      'options': 'tradier',
      'futures': 'tastytrade'
    };
    const expectedExchange = exchangeMapping[selectedAssetClass.value];
    return pos.exchange === expectedExchange;
  });
});

// Computed property for total unrealized P&L
const totalUnrealizedPnl = computed(() => {
  const total = filteredOpenPositions.value.reduce((sum, pos) => {
    const pnl = pos.unrealized_pnl_usd ?? 0;
    return sum + pnl;
  }, 0);
  return total;
});

// Computed property for average unrealized P&L percentage
const averageUnrealizedPnlPercent = computed(() => {
  const positions = filteredOpenPositions.value;
  if (positions.length === 0) {
    return 0;
  }
  
  // Calculate weighted average based on position size
  let totalWeightedPnl = 0;
  let totalPositionSize = 0;
  
  positions.forEach(pos => {
    const positionSize = pos.position_size_usd ?? 0;
    const pnlPercent = pos.unrealized_pnl_percent ?? 0;
    
    if (positionSize > 0) {
      totalWeightedPnl += pnlPercent * positionSize;
      totalPositionSize += positionSize;
    }
  });
  
  if (totalPositionSize === 0) {
    return 0;
  }
  
  return totalWeightedPnl / totalPositionSize;
});


// Asset class selection
function selectAssetClass(assetClass: 'all' | AssetClass) {
  selectedAssetClass.value = assetClass;
  isLoading.value = true;
  
  // Show loading state immediately
  console.log(`Dashboard: Switching to ${assetClass} filter...`);
  
  // Load all data in parallel for better performance
  Promise.all([
    loadData(),
    loadChartData(),
    loadBalances()
  ]).then(() => {
    console.log(`Dashboard: ${assetClass} filter data loaded successfully`);
  }).catch((error) => {
    console.error(`Dashboard: Error loading ${assetClass} filter data:`, error);
  }).finally(() => {
    isLoading.value = false;
  });
}

// Load account balances
async function loadBalances() {
  try {
    const result = await $fetch('/api/balances');
    if (result && result.success) {
      // Filter balances based on selected asset class
      let filteredBalances = result.balances;
      
      if (selectedAssetClass.value !== 'all') {
        const exchangeMapping = {
          'forex': 'OANDA',
          'crypto': 'Aster DEX', 
          'stocks': 'Tradier',
          'options': 'Tradier',
          'futures': 'Tasty Trade'
        };
        const targetExchange = exchangeMapping[selectedAssetClass.value];
        filteredBalances = result.balances.filter((b: any) => b.exchange === targetExchange);
      }
      
      // Calculate total from filtered balances
      const total = filteredBalances
        .filter((b: any) => b.balance !== null)
        .reduce((sum: number, b: any) => sum + b.balance, 0);
      
      totalBalance.value = total;
    }
  } catch (error) {
    console.error('Error loading balances:', error);
    totalBalance.value = 0;
  }
}

// Load data
async function loadData() {
  try {
    isConnected.value = true;
    
    const assetFilter = selectedAssetClass.value === 'all' ? undefined : selectedAssetClass.value;
    
    console.log('Dashboard: Loading data with filter:', assetFilter);
    
    // Load positions from both Supabase and direct APIs
    const [supabasePositions, trades, stats] = await Promise.all([
      getOpenPositions(assetFilter),
      getRecentTrades(20, assetFilter),
      getTodaysStats(assetFilter),
    ]);

    // For crypto filter, we'll use the same Supabase data but filter it for crypto trades
    // This ensures we get all historical crypto trades, not just live positions

    // Load Aster DEX and OANDA positions for "All" filter and "Crypto" filter
    let asterPositions = [];
    let oandaPositions = [];
    
    // Load Aster DEX positions for "All" filter or "Crypto" filter
    if (assetFilter === undefined || assetFilter === 'crypto') {
      console.log('Dashboard: Loading Aster DEX positions for', assetFilter === undefined ? 'All' : 'Crypto', 'filter...');
      try {
        const asterResponse = await $fetch('/api/balance/aster-positions');
        console.log('Dashboard: Aster API response for', assetFilter === undefined ? 'All' : 'Crypto', 'filter:', asterResponse);
        if (asterResponse.success) {
          asterPositions = asterResponse.positions;
          console.log('Dashboard: Loaded Aster DEX positions:', asterPositions.length);
          console.log('Dashboard: Aster positions data:', asterPositions);
        } else {
          console.log('Dashboard: Aster API failed for', assetFilter === undefined ? 'All' : 'Crypto', 'filter:', asterResponse.error);
        }
      } catch (error) {
        console.error('Error loading Aster DEX positions:', error);
      }
    }

    // Load OANDA positions for "All" filter or "Forex" filter
    if (assetFilter === undefined || assetFilter === 'forex') {
      console.log('Dashboard: Loading OANDA positions for', assetFilter === undefined ? 'All' : 'Forex', 'filter...');
      try {
        const oandaResponse = await $fetch('/api/balance/oanda-positions');
        console.log('Dashboard: OANDA API response for', assetFilter === undefined ? 'All' : 'Forex', 'filter:', oandaResponse);
        if (oandaResponse.success) {
          oandaPositions = oandaResponse.positions;
          console.log('Dashboard: Loaded OANDA positions:', oandaPositions.length);
          console.log('Dashboard: OANDA positions data (full):', JSON.stringify(oandaPositions, null, 2));
          console.log('Dashboard: OANDA positions P&L data:', oandaPositions.map(p => ({
            symbol: p.symbol,
            exchange: p.exchange,
            unrealized_pnl_usd: p.unrealized_pnl_usd,
            unrealized_pnl_percent: p.unrealized_pnl_percent,
            entry_price: p.entry_price,
            current_price: p.current_price,
            quantity: p.quantity
          })));
        } else {
          console.log('Dashboard: OANDA API failed for', assetFilter === undefined ? 'All' : 'Forex', 'filter:', oandaResponse.error);
        }
      } catch (error) {
        console.error('Error loading OANDA positions:', error);
      }
    }

    // Combine positions based on filter
    // Priority: API positions (more accurate, real-time) > Supabase positions (might be stale)
    let finalPositions = [];
    if (assetFilter === undefined) {
      // For "All" filter, combine Supabase + live API positions
      // Prioritize API positions over Supabase (API positions are more accurate)
      finalPositions = [...asterPositions, ...oandaPositions, ...supabasePositions];
      console.log('Dashboard: Loaded Supabase positions:', supabasePositions.length);
      console.log('Dashboard: Loaded Aster DEX positions:', asterPositions.length);
      console.log('Dashboard: Loaded OANDA positions:', oandaPositions.length);
    } else if (assetFilter === 'crypto') {
      // For "Crypto" filter, combine Supabase + Aster DEX live positions
      // Prioritize API positions
      finalPositions = [...asterPositions, ...supabasePositions];
      console.log('Dashboard: Loaded Supabase crypto positions:', supabasePositions.length);
      console.log('Dashboard: Loaded Aster DEX live positions:', asterPositions.length);
    } else if (assetFilter === 'forex') {
      // For "Forex" filter, combine Supabase + OANDA live positions
      // Prioritize API positions (OANDA has correct asset_class and real-time data)
      finalPositions = [...oandaPositions, ...supabasePositions];
      console.log('Dashboard: Loaded Supabase forex positions:', supabasePositions.length);
      console.log('Dashboard: Loaded OANDA live positions:', oandaPositions.length);
    } else {
      // For other asset filters (stocks, options), use only Supabase data
      finalPositions = supabasePositions;
      console.log('Dashboard: Using Supabase data for', assetFilter, 'filter:', supabasePositions.length, 'positions');
    }
    
    // Deduplicate positions: prioritize API positions (more accurate, real-time) over Supabase
    // Strategy: For same symbol, prefer the most relevant exchange based on asset class
    // Priority order: OANDA (forex) > TastyTrade (futures) > Tradier (stocks/options) > Aster (crypto) > Supabase
    const positionMap = new Map();
    const isApiPosition = (pos: any) => {
      return pos.exchange && ['aster', 'oanda', 'tradier', 'tastytrade'].includes(pos.exchange.toLowerCase());
    };
    
    // Exchange priority (higher number = higher priority)
    const exchangePriority: Record<string, number> = {
      'oanda': 4,      // Highest priority for forex
      'tastytrade': 3, // Futures
      'tradier': 2,    // Stocks/Options
      'aster': 1,      // Crypto
      'unknown': 0,    // Unknown/Supabase
    };
    
    const getExchangePriority = (pos: any): number => {
      const exchange = (pos.exchange || 'unknown').toLowerCase();
      return exchangePriority[exchange] || 0;
    };
    
    console.log('Dashboard: Starting deduplication with', finalPositions.length, 'positions');
    console.log('Dashboard: Positions before deduplication:', finalPositions.map(p => ({
      symbol: p.symbol,
      exchange: p.exchange,
      isApi: isApiPosition(p),
      priority: getExchangePriority(p),
      unrealized_pnl_usd: p.unrealized_pnl_usd,
      unrealized_pnl_percent: p.unrealized_pnl_percent
    })));
    
    // Process all positions and keep the one with highest priority for each symbol
    finalPositions.forEach(pos => {
      const key = (pos.symbol || '').toUpperCase();
      const currentPos = positionMap.get(key);
      const currentPriority = currentPos ? getExchangePriority(currentPos) : -1;
      const newPriority = getExchangePriority(pos);
      
      // Only replace if this position has higher priority
      if (!currentPos || newPriority > currentPriority) {
        if (currentPos) {
          console.log(`Dashboard: Replacing position ${key}: ${currentPos.exchange} (priority ${currentPriority}) -> ${pos.exchange} (priority ${newPriority})`);
        } else {
          console.log(`Dashboard: Adding position ${key} from ${pos.exchange} (priority ${newPriority}) with P&L:`, {
            unrealized_pnl_usd: pos.unrealized_pnl_usd,
            unrealized_pnl_percent: pos.unrealized_pnl_percent,
            exchange: pos.exchange
          });
        }
        positionMap.set(key, pos);
      } else {
        console.log(`Dashboard: Keeping existing position ${key} from ${currentPos.exchange} (priority ${currentPriority}) over ${pos.exchange} (priority ${newPriority})`);
      }
    });
    
    finalPositions = Array.from(positionMap.values());
    
    console.log('Dashboard: After deduplication, total positions:', finalPositions.length);
    console.log('Dashboard: Positions by source:', {
      api: finalPositions.filter(p => isApiPosition(p)).length,
      supabase: finalPositions.filter(p => !isApiPosition(p)).length
    });
    console.log('Dashboard: Final positions after deduplication:', finalPositions.map(p => ({
      symbol: p.symbol,
      exchange: p.exchange,
      isApi: isApiPosition(p),
      priority: getExchangePriority(p),
      unrealized_pnl_usd: p.unrealized_pnl_usd,
      unrealized_pnl_percent: p.unrealized_pnl_percent
    })));
    console.log('Dashboard: Loaded trades:', trades.length);

    console.log('Dashboard: Setting openPositions.value to:', finalPositions);
    console.log('Dashboard: Setting recentTrades.value to:', trades);
    console.log('Dashboard: Setting todaysStats.value to:', stats);
    
    // Validate position data structure and fix asset_class if missing or incorrect
    const validatedPositions = finalPositions.map(pos => {
      const exchange = pos.exchange?.toLowerCase();
      const symbol = (pos.symbol || '').toUpperCase();
      let assetClass = pos.asset_class;
      
      // DEBUG: Log position data before validation
      console.log(`Dashboard: Validating position ${symbol}:`, {
        exchange,
        unrealized_pnl_usd: pos.unrealized_pnl_usd,
        unrealized_pnl_percent: pos.unrealized_pnl_percent,
        current_price: pos.current_price,
        entry_price: pos.entry_price,
        quantity: pos.quantity,
        rawPosition: pos
      });
      
      // CRITICAL: Always correct asset_class based on exchange (overrides incorrect Supabase data)
      // This ensures OANDA positions always show as 'forex', Aster as 'crypto', etc.
      if (exchange === 'oanda') {
        assetClass = 'forex';
      } else if (exchange === 'aster') {
        assetClass = 'crypto';
      } else if (exchange === 'tastytrade') {
        assetClass = 'futures';
      } else if (exchange === 'tradier') {
        // Tradier can be stocks or options - try to infer from symbol
        if (symbol.match(/^\d+$/) || symbol.includes('C') || symbol.includes('P')) {
          assetClass = 'options';
        } else {
          assetClass = 'stocks';
        }
      }
      // If exchange is unknown, try to infer from symbol format
      else if (!assetClass || assetClass === 'unknown') {
        // Forex pairs: EUR_USD, GBP_USD, etc. (typically 3-letter pairs with underscore)
        if (symbol.includes('_') && symbol.match(/^[A-Z]{3}_[A-Z]{3}$/)) {
          assetClass = 'forex';
        } else if (symbol.includes('/') && symbol.match(/^[A-Z]{3}\/[A-Z]{3}$/)) {
          assetClass = 'forex';
        }
        // Crypto symbols: BTCUSDT, ETHUSD, etc. (typically contain USDT, BTC, ETH)
        else if ((symbol.includes('USDT') || symbol.includes('BTC') || symbol.includes('ETH') || symbol.endsWith('USDT')) && !symbol.includes('_') && !symbol.includes('/')) {
          assetClass = 'crypto';
        }
      }
      
      // CRITICAL: Preserve P&L data correctly - handle null/undefined but preserve negative values
      // Use nullish coalescing (??) instead of logical OR (||) to preserve 0 and negative values
      const unrealizedPnlUsd = pos.unrealized_pnl_usd != null ? pos.unrealized_pnl_usd : 0;
      const unrealizedPnlPercent = pos.unrealized_pnl_percent != null ? pos.unrealized_pnl_percent : 0;
      
      const validatedPos = {
        id: pos.id || `${pos.symbol}_${Date.now()}`,
        symbol: pos.symbol || 'Unknown',
        side: pos.side || 'UNKNOWN',
        entry_price: pos.entry_price || 0,
        current_price: pos.current_price != null ? pos.current_price : (pos.entry_price || 0),
        quantity: pos.quantity || 0,
        position_size_usd: pos.position_size_usd || 0,
        unrealized_pnl_usd: unrealizedPnlUsd,
        unrealized_pnl_percent: unrealizedPnlPercent,
        entry_time: pos.entry_time || new Date().toISOString(),
        exchange: pos.exchange || 'unknown',
        asset_class: assetClass || 'unknown',
        stop_loss_price: pos.stop_loss_price != null ? pos.stop_loss_price : null,
        take_profit_price: pos.take_profit_price != null ? pos.take_profit_price : null,
        stop_loss_percent: pos.stop_loss_percent != null ? pos.stop_loss_percent : null,
        take_profit_percent: pos.take_profit_percent != null ? pos.take_profit_percent : null
      };
      
      // DEBUG: Log validated position
      console.log(`Dashboard: Validated position ${symbol}:`, {
        unrealized_pnl_usd: validatedPos.unrealized_pnl_usd,
        unrealized_pnl_percent: validatedPos.unrealized_pnl_percent,
        validatedPosition: validatedPos
      });
      
      return validatedPos;
    });
    
    // DEBUG: Log final validated positions before assignment
    console.log('Dashboard: Final validated positions before assignment:', validatedPositions.map(p => ({
      symbol: p.symbol,
      exchange: p.exchange,
      unrealized_pnl_usd: p.unrealized_pnl_usd,
      unrealized_pnl_percent: p.unrealized_pnl_percent,
      entry_price: p.entry_price,
      current_price: p.current_price,
      quantity: p.quantity
    })));
    
    openPositions.value = validatedPositions as any;
    recentTrades.value = trades;
    todaysStats.value = stats;
    
    // DEBUG: Verify the values were set correctly
    console.log('Dashboard: After setting values - openPositions.value.length:', openPositions.value.length);
    console.log('Dashboard: After setting values - openPositions.value:', openPositions.value.map(p => ({
      symbol: p.symbol,
      exchange: p.exchange,
      unrealized_pnl_usd: p.unrealized_pnl_usd,
      unrealized_pnl_percent: p.unrealized_pnl_percent
    })));
    console.log('Dashboard: After setting values - recentTrades.value.length:', recentTrades.value.length);
  } catch (error) {
    console.error('Error loading data:', error);
    isConnected.value = false;
  }
}

// Load chart data
async function loadChartData() {
  try {
    const assetFilter = selectedAssetClass.value === 'all' ? undefined : selectedAssetClass.value;
    console.log('Dashboard: Loading chart data for', chartDays.value, 'days with filter:', assetFilter);
    const data = await getCumulativePnL(chartDays.value, assetFilter);
    console.log('Dashboard: Chart data loaded:', data);
    console.log('Dashboard: Chart data length:', data.length);
    if (data.length === 0) {
      console.log('Dashboard: No chart data available - no closed trades in the last', chartDays.value, 'days');
    }
    renderChart(data);
  } catch (error) {
    console.error('Error loading chart data:', error);
  }
}

// Render chart
function renderChart(data: Array<{ date: string; cumulative_pnl: number }>) {
  if (!pnlChart.value) {
    console.log('Dashboard: Chart canvas not available');
    return;
  }

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const ctx = pnlChart.value.getContext('2d');
  if (!ctx) {
    console.log('Dashboard: Chart context not available');
    return;
  }

  // Handle empty data
  if (!data || data.length === 0) {
    console.log('Dashboard: No data to render in chart - showing empty state');
    // Create a chart with empty data that shows a message
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Cumulative P&L',
          data: [],
          borderColor: '#6b7280',
          backgroundColor: 'rgba(107, 114, 128, 0.1)',
          borderWidth: 0,
          fill: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        },
        scales: {
          x: {
            display: false
          },
          y: {
            display: false
          }
        }
      },
      plugins: [{
        id: 'empty-state',
        afterDraw: (chart) => {
          const { ctx, chartArea } = chart;
          if (!chartArea) return;
          
          ctx.save();
          ctx.fillStyle = '#9ca3af';
          ctx.font = '14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            'No closed trades in the selected period',
            (chartArea.left + chartArea.right) / 2,
            (chartArea.top + chartArea.bottom) / 2
          );
          ctx.restore();
        }
      }]
    });
    return;
  }

  // Handle single data point (need at least 2 points for a line to be visible)
  if (data.length === 1) {
    console.log('Dashboard: Only one data point - duplicating for chart visibility');
    // Duplicate the single point to create a visible line
    data = [
      { date: data[0].date, cumulative_pnl: 0 }, // Start at zero
      data[0] // Then show the actual P&L
    ];
  }

  console.log('Dashboard: Rendering chart with', data.length, 'data points');
  console.log('Dashboard: Chart data:', data);

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.date),
      datasets: [{
        label: 'Cumulative P&L',
        data: data.map(d => d.cumulative_pnl),
        borderColor: (data[data.length - 1]?.cumulative_pnl ?? 0) >= 0 ? '#10b981' : '#ef4444',
        backgroundColor: (data[data.length - 1]?.cumulative_pnl ?? 0) >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: data.length <= 10 ? 4 : 0, // Show points if few data points
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `P&L: $${context.parsed.y.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        x: {
          display: data.length > 0,
          ticks: {
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          beginAtZero: false, // Don't force zero - show actual range
          ticks: {
            callback: (value) => `$${value.toFixed(2)}`
          }
        }
      }
    }
  });
}

// Get asset class label from asset_class or exchange
function getAssetClassLabel(assetClass: string | null | undefined, exchange: string | null | undefined): string {
  // First, try to use asset_class if available
  if (assetClass) {
    switch (assetClass.toLowerCase()) {
      case 'crypto': return 'Crypto';
      case 'forex': return 'Forex';
      case 'stocks': return 'Stocks';
      case 'options': return 'Options';
      case 'futures': return 'Futures';
      default: return assetClass.charAt(0).toUpperCase() + assetClass.slice(1);
    }
  }
  
  // Fall back to exchange mapping if asset_class is not available
  if (exchange) {
    switch (exchange.toLowerCase()) {
      case 'aster': return 'Crypto';
      case 'oanda': return 'Forex';
      case 'tradier': return 'Stocks';
      case 'tastytrade': return 'Futures';
      default: return exchange;
    }
  }
  
  return 'Unknown';
}

// Format duration
function formatDuration(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${minutes}m`;
}

// Format time
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

// Sync trades - detect closed positions and save them as trades
async function syncTrades() {
  try {
    isSyncingTrades.value = true;
    console.log('Dashboard: Syncing trades...');
    
    const response = await $fetch('/api/trades/sync', {
      method: 'GET'
    });
    
    if (response.success) {
      console.log('Dashboard: Trade sync successful:', response);
      // Reload chart data to show new trades
      await loadChartData();
      // Reload data to refresh recent trades
      await loadData();
      
      const count = response.count || 0;
      toast.add({
        title: 'Trades synced',
        description: `Successfully synced ${count} closed ${count === 1 ? 'trade' : 'trades'}.`,
        icon: 'i-heroicons-check-circle',
        color: 'success',
      });
    } else {
      console.error('Dashboard: Trade sync failed:', response.error);
      toast.add({
        title: 'Trade sync failed',
        description: response.error || 'Unknown error occurred.',
        color: 'error',
      });
    }
  } catch (error) {
    console.error('Dashboard: Error syncing trades:', error);
    toast.add({
      title: 'Error syncing trades',
      description: 'Check console for details.',
      color: 'error',
    });
  } finally {
    isSyncingTrades.value = false;
  }
}

// Auto-refresh data every 30 seconds
let refreshInterval: NodeJS.Timeout | null = null;

onMounted(async () => {
  console.log('Dashboard: Component mounted, starting data load...');
  
  // Wait for next tick to ensure canvas is available
  await nextTick();
  
  await loadData();
  await loadChartData();
  await loadBalances();
  
  console.log('Dashboard: Initial load complete, setting up auto-refresh...');
  
  // Set up auto-refresh
  refreshInterval = setInterval(() => {
    console.log('Dashboard: Auto-refresh triggered...');
    loadData();
    loadChartData(); // Also refresh chart data
    loadBalances();
    // Note: Exchange connections are only tested on initial load and manual refresh
    // to avoid interference between multiple simultaneous API calls
  }, 30000); // 30 seconds
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  if (chartInstance) {
    chartInstance.destroy();
  }
});

// Initial load
definePageMeta({
  title: 'TradeFI Dashboard',
  description: 'Real-time analytics across all trading bots'
});
</script>

<style scoped>
/* Custom scrollbar for recent trades */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
