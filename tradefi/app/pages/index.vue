<template>
  <div class="space-y-8 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-semibold text-foreground">Dashboard Overview</h1>
        <p class="text-muted-foreground text-sm mt-1">Real-time analytics across all trading bots</p>
      </div>
      <Badge :variant="isConnected ? 'success' : 'error'" class="text-sm px-3 py-1">
        {{ isConnected ? 'Connected' : 'Disconnected' }}
      </Badge>
    </div>

    <!-- Asset Class Filter -->
    <div class="flex gap-2 flex-wrap">
      <Button
        v-for="asset in assetClasses"
        :key="asset.value"
        @click="selectAssetClass(asset.value)"
        :variant="selectedAssetClass === asset.value ? 'default' : 'outline'"
        size="sm"
      >
        {{ asset.label }}
      </Button>
    </div>

    <!-- Real-Time Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Total Portfolio -->
      <CardsWrapper>
        <template #stats-header>
          <div class="h-2 w-2 rounded-full bg-primary" />
          <CardTitle>Total Portfolio</CardTitle>
        </template>
        <template #stats-body>
          <div class="text-center space-y-2">
            <p class="text-4xl font-bold text-foreground">
              <span v-if="isLoading" class="animate-pulse">Loading...</span>
              <span v-else>${{ totalBalance.toFixed(2) }}</span>
            </p>
            <p class="text-sm text-muted-foreground">{{ portfolioDescription }}</p>
          </div>
        </template>
      </CardsWrapper>

      <!-- P&L Card -->
      <CardsWrapper>
        <template #stats-header>
          <div class="h-2 w-2 rounded-full bg-yellow-500" />
          <CardTitle>P&L</CardTitle>
        </template>
        <template #stats-body>
          <div class="space-y-4">
            <div class="flex justify-center gap-2">
              <Button
                size="sm"
                @click="pnlView = 'realized'"
                :variant="pnlView === 'realized' ? 'default' : 'outline'"
              >
                Realized
              </Button>
              <Button
                size="sm"
                @click="pnlView = 'unrealized'"
                :variant="pnlView === 'unrealized' ? 'default' : 'outline'"
              >
                Unrealized
              </Button>
            </div>
            
            <div class="text-center space-y-4">
              <!-- Realized P&L View -->
              <div v-if="pnlView === 'realized'">
                <div>
                  <p class="text-xs text-muted-foreground mb-1">Today's Realized P&L</p>
                  <p :class="[
                    'text-3xl font-bold',
                    isLoading ? 'text-muted-foreground' : (todaysStats.todayPnL >= 0 ? 'text-green-400' : 'text-red-400')
                  ]">
                    <span v-if="isLoading" class="animate-pulse">Loading...</span>
                    <span v-else>{{ todaysStats.todayPnL >= 0 ? '+' : '' }}${{ todaysStats.todayPnL.toFixed(2) }}</span>
                  </p>
                </div>
                
                <div>
                  <div class="flex items-center justify-center gap-2 mb-2">
                    <Icon name="i-heroicons-star" class="w-4 h-4 text-muted-foreground" />
                    <p class="text-sm text-muted-foreground font-medium">Win Rate</p>
                  </div>
                  <div 
                    v-if="isLoading"
                    class="text-3xl font-bold text-muted-foreground animate-pulse"
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
                      'text-muted-foreground': todaysStats.totalTrades === 0
                    }"
                  >
                    {{ todaysStats.winRate.toFixed(1) }}%
                  </div>
                  <div class="text-sm text-muted-foreground mt-1">
                    {{ Math.round(todaysStats.totalTrades * todaysStats.winRate / 100) }}/{{ todaysStats.totalTrades }} trades
                  </div>
                </div>
              </div>
              
              <!-- Unrealized P&L View -->
              <div v-else-if="pnlView === 'unrealized'">
                <div>
                  <p class="text-xs text-muted-foreground mb-1">Current Unrealized P&L</p>
                  <p :class="[
                    'text-3xl font-bold',
                    isLoading ? 'text-muted-foreground' : (totalUnrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400')
                  ]">
                    <span v-if="isLoading" class="animate-pulse">Loading...</span>
                    <span v-else>{{ totalUnrealizedPnl >= 0 ? '+' : '' }}${{ totalUnrealizedPnl.toFixed(2) }}</span>
                  </p>
                </div>
                
                <div>
                  <div class="flex items-center justify-center gap-2 mb-2">
                    <Icon name="i-heroicons-shopping-cart" class="w-4 h-4 text-muted-foreground" />
                    <p class="text-sm text-muted-foreground font-medium">Open Positions</p>
                  </div>
                  <div 
                    v-if="isLoading"
                    class="text-3xl font-bold text-muted-foreground animate-pulse"
                  >
                    Loading...
                  </div>
                  <div 
                    v-else
                    class="text-3xl font-bold text-foreground"
                  >
                    {{ filteredOpenPositions.length }}
                  </div>
                  <div class="text-sm text-muted-foreground mt-1">
                    {{ filteredOpenPositions.length === 1 ? 'position' : 'positions' }}
                  </div>
                </div>
                
                <div>
                  <div class="flex items-center justify-center gap-2 mb-2">
                    <Icon name="i-heroicons-chart-bar-square" class="w-4 h-4 text-muted-foreground" />
                    <p class="text-sm text-muted-foreground font-medium">Avg P&L %</p>
                  </div>
                  <div 
                    v-if="isLoading"
                    class="text-2xl font-bold text-muted-foreground animate-pulse"
                  >
                    Loading...
                  </div>
                  <div 
                    v-else-if="filteredOpenPositions.length === 0"
                    class="text-2xl font-bold text-muted-foreground"
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
          </div>
        </template>
      </CardsWrapper>

      <!-- Open Positions -->
      <CardsWrapper>
        <template #stats-header>
          <div class="h-2 w-2 rounded-full bg-green-500" />
          <CardTitle>Open Positions</CardTitle>
        </template>
        <template #stats-body>
          <div class="text-center space-y-4">
            <div>
              <p class="text-4xl font-bold text-foreground">{{ filteredOpenPositions.length }}</p>
              <p class="text-sm text-muted-foreground mt-1">Active Positions</p>
            </div>
            
            <div>
              <p class="text-lg font-semibold text-foreground">{{ todaysStats.totalTrades }}</p>
              <p class="text-sm text-muted-foreground">Today's Trades</p>
            </div>
          </div>
        </template>
      </CardsWrapper>
    </div>


    <!-- P&L Chart and Recent Trades Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- P&L Chart -->
      <CardsWrapper>
        <template #stats-header>
          <div class="h-2 w-2 rounded-full bg-blue-500" />
          <CardTitle>Cumulative P&L</CardTitle>
        </template>
        <template #stats-body>
          <div class="space-y-4">
            <div class="flex justify-center gap-2">
              <Button
                size="sm"
                @click="chartDays = 7; loadChartData()"
                :variant="chartDays === 7 ? 'default' : 'outline'"
              >
                7D
              </Button>
              <Button
                size="sm"
                @click="chartDays = 30; loadChartData()"
                :variant="chartDays === 30 ? 'default' : 'outline'"
              >
                30D
              </Button>
              <Button
                size="sm"
                @click="syncTrades"
                :disabled="isSyncingTrades"
                variant="outline"
              >
                <span v-if="isSyncingTrades">Syncing...</span>
                <span v-else>Sync Trades</span>
              </Button>
            </div>
            <div class="pt-2">
              <!-- Loading state -->
              <div v-if="isLoadingChart" class="h-64 flex items-center justify-center">
                <div class="text-center">
                  <div class="animate-pulse text-muted-foreground">Loading chart...</div>
                </div>
              </div>
              
              <!-- Empty state -->
              <div v-else-if="!chartData || chartData.length === 0" class="h-64 flex items-center justify-center">
                <div class="text-center">
                  <p class="text-muted-foreground">No closed trades in the selected period</p>
                </div>
              </div>
              
              <!-- Nuxt Charts AreaChart -->
              <AreaChart
                v-else
                :data="chartData"
                :height="256"
                :categories="{ pnl: { name: 'Cumulative P&L', color: chartColor } }"
                :y-axis="['pnl']"
                :y-formatter="formatCurrency"
                :x-formatter="formatChartDate"
                curve-type="monotoneX"
                legend-position="bottomCenter"
                :y-num-ticks="5"
                :grid-line-y="true"
              />
            </div>
          </div>
        </template>
      </CardsWrapper>

      <!-- Recent Trades / Open Trades -->
      <CardsWrapper>
        <template #stats-header>
          <div class="h-2 w-2 rounded-full bg-purple-500" />
          <CardTitle>Trades</CardTitle>
        </template>
        <template #stats-body>
          <div class="space-y-4">
            <div class="flex justify-center gap-2">
              <Button
                size="sm"
                @click="tradeView = 'recent'"
                :variant="tradeView === 'recent' ? 'default' : 'outline'"
              >
                Recent Trades
              </Button>
              <Button
                size="sm"
                @click="tradeView = 'open'"
                :variant="tradeView === 'open' ? 'default' : 'outline'"
              >
                Open Trades
              </Button>
            </div>
            
            <!-- Recent Trades View -->
            <div v-if="tradeView === 'recent'" class="max-h-72 overflow-y-auto">
              <div v-if="isLoading" class="text-center py-8 text-muted-foreground">
                <div class="animate-pulse">Loading trades...</div>
              </div>
              
              <Table v-else-if="recentTrades.length > 0">
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead class="text-right">P&L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow 
                    v-for="trade in recentTrades" 
                    :key="trade.id"
                    class="hover:bg-accent"
                  >
                    <TableCell class="font-mono font-semibold">
                      {{ trade.symbol }}
                    </TableCell>
                    <TableCell>
                      <div class="flex items-center gap-2">
                        <Badge :variant="trade.side === 'BUY' ? 'success' : 'error'" class="text-xs">
                          {{ trade.side }}
                        </Badge>
                        <Badge v-if="trade.asset_class || trade.exchange" variant="outline" class="text-xs">
                          {{ getAssetClassLabel(trade.asset_class, trade.exchange) }}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell class="text-muted-foreground text-sm">
                      {{ formatTime(trade.exit_time) }}
                    </TableCell>
                    <TableCell class="text-right">
                      <div :class="[
                        'font-mono font-semibold',
                        trade.is_winner ? 'text-green-400' : 'text-red-400'
                      ]">
                        {{ trade.pnl_usd >= 0 ? '+' : '' }}${{ trade.pnl_usd.toFixed(2) }}
                      </div>
                      <div class="text-xs text-muted-foreground">
                        {{ trade.pnl_percent.toFixed(2) }}%
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <div v-else class="text-center py-8 text-muted-foreground">
                No trades yet
              </div>
            </div>

            <!-- Open Trades View -->
            <div v-else-if="tradeView === 'open'" class="max-h-96 overflow-y-auto">
              <div v-if="isLoading" class="text-center py-8 text-muted-foreground">
                <div class="animate-pulse">Loading positions...</div>
              </div>
              
              <Table v-else-if="filteredOpenPositions.length > 0">
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Entry</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead class="text-right">P&L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow 
                    v-for="position in filteredOpenPositions" 
                    :key="position.id"
                    class="hover:bg-accent"
                  >
                    <TableCell class="font-mono font-semibold">
                      {{ position.symbol }}
                    </TableCell>
                    <TableCell>
                      <div class="flex items-center gap-2">
                        <Badge :variant="position.side === 'BUY' ? 'success' : 'error'" class="text-xs">
                          {{ position.side }}
                        </Badge>
                        <Badge v-if="position.asset_class || position.exchange" variant="outline" class="text-xs">
                          {{ getAssetClassLabel(position.asset_class, position.exchange) }}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell class="text-sm">
                      ${{ (position.entry_price || 0).toFixed(2) }}
                    </TableCell>
                    <TableCell class="text-sm">
                      ${{ (position.current_price || position.entry_price || 0).toFixed(2) }}
                    </TableCell>
                    <TableCell class="text-sm">
                      {{ (position.quantity || 0).toFixed(4) }}
                    </TableCell>
                    <TableCell class="text-sm text-muted-foreground">
                      {{ formatDuration(position.entry_time) }}
                    </TableCell>
                    <TableCell class="text-right">
                      <div :class="[
                        'font-mono font-semibold',
                        (position.unrealized_pnl_usd ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      ]">
                        {{ (position.unrealized_pnl_usd ?? 0) >= 0 ? '+' : '' }}${{ (position.unrealized_pnl_usd ?? 0).toFixed(2) }}
                      </div>
                      <div :class="[
                        'text-xs',
                        (position.unrealized_pnl_percent ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      ]">
                        {{ (position.unrealized_pnl_percent ?? 0) >= 0 ? '+' : '' }}{{ (position.unrealized_pnl_percent ?? 0).toFixed(2) }}%
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <div v-else class="text-center py-8 text-muted-foreground">
                No open positions
              </div>
            </div>
          </div>
        </template>
      </CardsWrapper>
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
const chartData = ref<Array<{ date: string; pnl: number }>>([]);
const isLoadingChart = ref(false);
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

// Chart color based on final P&L
const chartColor = computed(() => {
  if (chartData.value.length === 0) return '#6b7280';
  const finalPnl = chartData.value[chartData.value.length - 1]?.pnl ?? 0;
  return finalPnl >= 0 ? '#10b981' : '#ef4444';
});

// Chart formatters
const formatCurrency = (value: number) => {
  return `$${value.toFixed(2)}`;
};

const formatChartDate = (i: number) => {
  return chartData.value[i]?.date || '';
};


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
    isLoadingChart.value = true;
    const assetFilter = selectedAssetClass.value === 'all' ? undefined : selectedAssetClass.value;
    console.log('Dashboard: Loading chart data for', chartDays.value, 'days with filter:', assetFilter);
    
    const data = await getCumulativePnL(chartDays.value, assetFilter);
    console.log('Dashboard: Chart data loaded:', data.length, 'points');
    
    // Transform data for Nuxt Charts
    chartData.value = data.map(d => ({
      date: d.date,
      pnl: d.cumulative_pnl
    }));
    
    // Handle single data point - add a starting point at zero
    if (chartData.value.length === 1) {
      console.log('Dashboard: Only one data point - adding starting point');
      chartData.value = [
        { date: chartData.value[0].date, pnl: 0 },
        chartData.value[0]
      ];
    }
  } catch (error) {
    console.error('Error loading chart data:', error);
    chartData.value = [];
  } finally {
    isLoadingChart.value = false;
  }
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
