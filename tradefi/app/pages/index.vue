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
          'font-semibold flex flex-col items-center py-3 px-4 min-w-[100px] transition-all duration-200',
          selectedAssetClass === asset.value 
            ? 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 border border-blue-500/30' 
            : 'bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white border border-gray-500/30'
        ]"
      >
        <span class="text-sm font-bold">{{ asset.label }}</span>
        <span class="text-xs opacity-80 mt-1">{{ asset.exchange }}</span>
      </UButton>
    </div>

    <!-- Real-Time Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <!-- Today's P&L -->
      <UCard class="bg-gradient-to-br from-green-900/20 to-emerald-800/10 border border-green-500/20 shadow-lg shadow-green-500/10">
        <div class="text-center space-y-4">
          <div class="flex items-center justify-center gap-2">
            <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-green-400" />
            <p class="text-sm text-green-300 font-medium">Today's P&L</p>
          </div>
          
          <div>
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
              <UIcon name="i-heroicons-target" class="w-4 h-4 text-green-400" />
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
      </UCard>

      <!-- Open Positions -->
      <UCard class="bg-gradient-to-br from-orange-900/20 to-amber-800/10 border border-orange-500/20 shadow-lg shadow-orange-500/10">
        <div class="text-center space-y-4">
          <div class="flex items-center justify-center gap-2">
            <UIcon name="i-heroicons-shopping-cart" class="w-5 h-5 text-orange-400" />
            <p class="text-sm text-orange-300 font-medium">Open Positions</p>
          </div>
          
          <div>
            <p class="text-4xl font-bold text-white">{{ openPositions.length }}</p>
            <p class="text-sm text-orange-200/70 mt-1">Active Positions</p>
          </div>
          
          <div>
            <p class="text-lg font-semibold text-orange-300">{{ todaysStats.totalTrades }}</p>
            <p class="text-sm text-orange-200/70">Today's Trades</p>
          </div>
          
        </div>
      </UCard>

      <!-- Active Exchanges -->
      <UCard class="bg-gradient-to-br from-purple-900/20 to-violet-800/10 border border-purple-500/20 shadow-lg shadow-purple-500/10">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-sm text-purple-300 font-medium">Exchange Status</p>
            <div class="p-2 bg-purple-500/20 rounded-full">
              <UIcon name="i-heroicons-arrows-right-left" class="w-5 h-5 text-purple-400" />
            </div>
          </div>
          
          <div class="space-y-1">
            <div 
              v-for="exchange in exchangeStatuses" 
              :key="exchange.name"
              class="flex items-center justify-between py-2 px-3 rounded-lg backdrop-blur-sm"
              :class="exchange.status === 'connected' ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'"
            >
              <div class="flex items-center gap-3">
                <div 
                  class="w-3 h-3 rounded-full shadow-sm"
                  :class="exchange.status === 'connected' ? 'bg-green-400 shadow-green-400/50' : 'bg-red-400 shadow-red-400/50'"
                ></div>
                <span class="text-sm font-medium text-white">{{ exchange.name }}</span>
              </div>
              
              <div class="text-right">
                <div 
                  class="text-sm font-semibold"
                  :class="exchange.status === 'connected' ? 'text-green-400' : 'text-red-400'"
                >
                  {{ exchange.status === 'connected' ? 'Connected' : 'Disconnected' }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="text-xs text-purple-200/70 text-center">
            {{ activeExchanges }} of {{ exchangeStatuses.length }} exchanges active
          </div>
          
          <div class="flex justify-center">
            <UButton 
              @click="testExchangeConnections" 
              size="xs" 
              class="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 hover:text-purple-200 text-xs"
            >
              <UIcon name="i-heroicons-arrow-path" class="w-3 h-3 mr-1" />
              Refresh Status
            </UButton>
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
            </div>
          </div>
        </template>
        <div class="h-64" ref="chartContainer">
          <!-- Chart will be rendered here -->
          <canvas ref="pnlChart"></canvas>
        </div>
      </UCard>

      <!-- Recent Trades -->
      <UCard class="bg-gradient-to-br from-indigo-900/20 to-purple-800/10 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
        <template #header>
          <h3 class="text-lg font-semibold text-indigo-300">Recent Trades</h3>
        </template>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div v-if="isLoading" class="text-center py-8 text-gray-500">
            <div class="animate-pulse">Loading trades...</div>
          </div>
          <div
            v-else-if="recentTrades.length > 0"
            v-for="trade in recentTrades"
            :key="trade.id"
            class="flex items-center justify-between p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm"
          >
            <div class="flex items-center gap-3">
              <UBadge :color="trade.side === 'BUY' ? 'success' : 'error'" size="xs">
                {{ trade.side }}
              </UBadge>
              <span class="font-mono font-semibold">{{ trade.symbol }}</span>
              <UBadge v-if="trade.exchange" size="xs" color="neutral">
                {{ trade.exchange === 'aster' ? 'Crypto' : trade.exchange === 'oanda' ? 'Forex' : trade.exchange === 'tradier' ? 'Stocks' : trade.exchange }}
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
          <div v-if="recentTrades.length === 0" class="text-center py-8 text-gray-500">
            No trades yet
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
const activeExchanges = ref(0);
const exchangeStatuses = ref([
  { name: 'Aster DEX', status: 'disconnected' as 'connected' | 'disconnected', balance: null as number | null, lastCheck: null as Date | null },
  { name: 'OANDA', status: 'disconnected' as 'connected' | 'disconnected', balance: null as number | null, lastCheck: null as Date | null },
  { name: 'Tradier', status: 'disconnected' as 'connected' | 'disconnected', balance: null as number | null, lastCheck: null as Date | null }
]);

// Computed property for portfolio description
const portfolioDescription = computed(() => {
  switch (selectedAssetClass.value) {
    case 'forex': return 'OANDA Forex only';
    case 'crypto': return 'Aster DEX Crypto only';
    case 'stocks': return 'Tradier Stocks only';
    case 'options': return 'Tradier Options only';
    default: return 'Across all exchanges';
  }
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

// Update individual exchange statuses
function updateExchangeStatuses(balances: any[]) {
  const now = new Date();
  
  exchangeStatuses.value.forEach(exchange => {
    const balance = balances.find(b => {
      switch (exchange.name) {
        case 'Aster DEX': return b.exchange === 'aster';
        case 'OANDA': return b.exchange === 'oanda';
        case 'Tradier': return b.exchange === 'tradier';
        default: return false;
      }
    });
    
    if (balance && balance.balance !== null) {
      exchange.status = 'connected';
      exchange.balance = balance.balance;
      exchange.lastCheck = now;
    } else {
      exchange.status = 'disconnected';
      exchange.balance = null;
      exchange.lastCheck = now;
    }
  });
}

// Test individual exchange connections
async function testExchangeConnections() {
  console.log('Dashboard: Starting exchange connection tests...');
  const tests = [
    { name: 'Aster DEX', test: () => $fetch('/api/balance/aster') },
    { name: 'OANDA', test: () => $fetch('/api/balance/oanda') },
    { name: 'Tradier', test: () => $fetch('/api/balance/tradier') }
  ];
  
  for (const test of tests) {
    try {
      console.log(`Dashboard: Testing ${test.name} connection...`);
      const response = await test.test();
      const exchange = exchangeStatuses.value.find(e => e.name === test.name);
      if (exchange) {
        const isConnected = response && response.balance !== null;
        exchange.status = isConnected ? 'connected' : 'disconnected';
        exchange.balance = response?.balance || null;
        exchange.lastCheck = new Date();
        console.log(`Dashboard: ${test.name} - ${isConnected ? 'Connected' : 'Disconnected'} (Balance: ${response?.balance || 'null'})`);
      }
    } catch (error) {
      console.log(`Dashboard: ${test.name} connection failed:`, error);
      const exchange = exchangeStatuses.value.find(e => e.name === test.name);
      if (exchange) {
        exchange.status = 'disconnected';
        exchange.balance = null;
        exchange.lastCheck = new Date();
      }
    }
  }
  console.log('Dashboard: Exchange connection tests completed.');
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
          'options': 'Tradier'
        };
        const targetExchange = exchangeMapping[selectedAssetClass.value];
        filteredBalances = result.balances.filter((b: any) => b.exchange === targetExchange);
      }
      
      // Calculate total from filtered balances
      const total = filteredBalances
        .filter((b: any) => b.balance !== null)
        .reduce((sum: number, b: any) => sum + b.balance, 0);
      
      totalBalance.value = total;
      activeExchanges.value = filteredBalances.filter((b: any) => b.balance !== null).length;
      
      // Update individual exchange statuses
      updateExchangeStatuses(result.balances);
    }
  } catch (error) {
    console.error('Error loading balances:', error);
    totalBalance.value = 0;
    activeExchanges.value = 0;
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
          console.log('Dashboard: OANDA positions data:', oandaPositions);
        } else {
          console.log('Dashboard: OANDA API failed for', assetFilter === undefined ? 'All' : 'Forex', 'filter:', oandaResponse.error);
        }
      } catch (error) {
        console.error('Error loading OANDA positions:', error);
      }
    }

    // Combine positions based on filter
    let finalPositions = [];
    if (assetFilter === undefined) {
      // For "All" filter, combine Supabase + live API positions
      finalPositions = [...supabasePositions, ...asterPositions, ...oandaPositions];
      console.log('Dashboard: Loaded Supabase positions:', supabasePositions.length);
      console.log('Dashboard: Loaded Aster DEX positions:', asterPositions.length);
      console.log('Dashboard: Loaded OANDA positions:', oandaPositions.length);
    } else if (assetFilter === 'crypto') {
      // For "Crypto" filter, combine Supabase + Aster DEX live positions
      finalPositions = [...supabasePositions, ...asterPositions];
      console.log('Dashboard: Loaded Supabase crypto positions:', supabasePositions.length);
      console.log('Dashboard: Loaded Aster DEX live positions:', asterPositions.length);
    } else if (assetFilter === 'forex') {
      // For "Forex" filter, combine Supabase + OANDA live positions
      finalPositions = [...supabasePositions, ...oandaPositions];
      console.log('Dashboard: Loaded Supabase forex positions:', supabasePositions.length);
      console.log('Dashboard: Loaded OANDA live positions:', oandaPositions.length);
    } else {
      // For other asset filters (stocks, options), use only Supabase data
      finalPositions = supabasePositions;
      console.log('Dashboard: Using Supabase data for', assetFilter, 'filter:', supabasePositions.length, 'positions');
    }
    
    console.log('Dashboard: Total positions:', finalPositions.length);
    console.log('Dashboard: Loaded trades:', trades.length);
    console.log('Dashboard: Final positions data:', finalPositions);

    console.log('Dashboard: Setting openPositions.value to:', finalPositions);
    console.log('Dashboard: Setting recentTrades.value to:', trades);
    console.log('Dashboard: Setting todaysStats.value to:', stats);
    
    // Validate position data structure
    const validatedPositions = finalPositions.map(pos => ({
      id: pos.id || `${pos.symbol}_${Date.now()}`,
      symbol: pos.symbol || 'Unknown',
      side: pos.side || 'UNKNOWN',
      entry_price: pos.entry_price || 0,
      current_price: pos.current_price || pos.entry_price || 0,
      position_size_usd: pos.position_size_usd || 0,
      unrealized_pnl_usd: pos.unrealized_pnl_usd || 0,
      unrealized_pnl_percent: pos.unrealized_pnl_percent || 0,
      entry_time: pos.entry_time || new Date().toISOString(),
      exchange: pos.exchange || 'unknown',
      asset_class: pos.asset_class || 'unknown'
    }));
    
    openPositions.value = validatedPositions as any;
    recentTrades.value = trades;
    todaysStats.value = stats;
    
    console.log('Dashboard: After setting values - openPositions.value.length:', openPositions.value.length);
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
    const data = await getCumulativePnL(chartDays.value, assetFilter);
    renderChart(data);
  } catch (error) {
    console.error('Error loading chart data:', error);
  }
}

// Render chart
function renderChart(data: Array<{ date: string; cumulative_pnl: number }>) {
  if (!pnlChart.value) return;

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = pnlChart.value.getContext('2d');
  if (!ctx) return;

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
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `$${value}`
          }
        }
      }
    }
  });
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

// Auto-refresh data every 30 seconds
let refreshInterval: NodeJS.Timeout | null = null;

onMounted(async () => {
  console.log('Dashboard: Component mounted, starting data load...');
  
  await loadData();
  await loadChartData();
  await loadBalances();
  
  // Test individual exchange connections for detailed status (with small delay to ensure page is ready)
  console.log('Dashboard: Testing individual exchange connections...');
  setTimeout(async () => {
    await testExchangeConnections();
  }, 1000); // 1 second delay to ensure page is fully loaded
  
  console.log('Dashboard: Initial load complete, setting up auto-refresh...');
  
  // Set up auto-refresh
  refreshInterval = setInterval(() => {
    console.log('Dashboard: Auto-refresh triggered...');
    loadData();
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
