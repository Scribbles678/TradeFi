<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Sparky Trading Bot</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Real-time analytics and performance tracking</p>
      </div>
      <UBadge :color="isConnected ? 'success' : 'error'" size="lg">
        {{ isConnected ? 'Connected' : 'Disconnected' }}
      </UBadge>
    </div>

    <!-- Real-Time Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Today's P&L -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Today's P&L</p>
            <p :class="[
              'text-2xl font-bold mt-1',
              todaysStats.todayPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            ]">
              {{ todaysStats.todayPnL >= 0 ? '+' : '' }}${{ todaysStats.todayPnL.toFixed(2) }}
            </p>
          </div>
          <UIcon name="i-heroicons-currency-dollar" class="w-10 h-10 text-gray-400" />
        </div>
      </UCard>

      <!-- Win Rate -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Win Rate</p>
            <p class="text-2xl font-bold mt-1">{{ todaysStats.winRate.toFixed(1) }}%</p>
          </div>
          <UIcon name="i-heroicons-chart-bar" class="w-10 h-10 text-gray-400" />
        </div>
      </UCard>

      <!-- Open Positions -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Open Positions</p>
            <p class="text-2xl font-bold mt-1">{{ openPositions.length }}</p>
          </div>
          <UIcon name="i-heroicons-shopping-cart" class="w-10 h-10 text-gray-400" />
        </div>
      </UCard>

      <!-- Total Trades Today -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Trades Today</p>
            <p class="text-2xl font-bold mt-1">{{ todaysStats.totalTrades }}</p>
          </div>
          <UIcon name="i-heroicons-arrows-right-left" class="w-10 h-10 text-gray-400" />
        </div>
      </UCard>
    </div>

    <!-- Open Positions Table -->
    <UCard v-if="openPositions.length > 0">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Open Positions</h3>
          <UBadge>{{ openPositions.length }} Active</UBadge>
        </div>
      </template>
      <UTable :columns="positionColumns" :rows="openPositions">
        <template #symbol-data="{ row }">
          <span class="font-mono font-semibold">{{ row.symbol }}</span>
        </template>
        <template #side-data="{ row }">
          <UBadge :color="row.side === 'BUY' ? 'green' : 'red'">
            {{ row.side }}
          </UBadge>
        </template>
        <template #entry_price-data="{ row }">
          <span class="font-mono">${{ parseFloat(row.entry_price).toFixed(2) }}</span>
        </template>
        <template #current_price-data="{ row }">
          <span class="font-mono">${{ parseFloat(row.current_price || row.entry_price).toFixed(2) }}</span>
        </template>
        <template #unrealized_pnl_usd-data="{ row }">
          <span :class="[
            'font-mono font-semibold',
            (row.unrealized_pnl_usd || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          ]">
            {{ (row.unrealized_pnl_usd || 0) >= 0 ? '+' : '' }}${{ (row.unrealized_pnl_usd || 0).toFixed(2) }}
            <span class="text-sm">
              ({{ (row.unrealized_pnl_percent || 0).toFixed(2) }}%)
            </span>
          </span>
        </template>
        <template #time_open-data="{ row }">
          <span class="text-sm text-gray-500">{{ formatDuration(row.entry_time) }}</span>
        </template>
      </UTable>
    </UCard>

    <!-- Empty State for Positions -->
    <UCard v-else>
      <template #header>
        <h3 class="text-lg font-semibold">Open Positions</h3>
      </template>
      <div class="text-center py-12">
        <UIcon name="i-heroicons-inbox" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400">No open positions</p>
      </div>
    </UCard>

    <!-- P&L Chart and Recent Trades Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- P&L Chart -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Cumulative P&L</h3>
            <div class="flex gap-2">
              <UButton
                :color="chartDays === 7 ? 'primary' : 'gray'"
                size="xs"
                @click="chartDays = 7; loadChartData()"
              >
                7D
              </UButton>
              <UButton
                :color="chartDays === 30 ? 'primary' : 'gray'"
                size="xs"
                @click="chartDays = 30; loadChartData()"
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
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Recent Trades</h3>
        </template>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="trade in recentTrades"
            :key="trade.id"
            class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
          >
            <div class="flex items-center gap-3">
              <UBadge :color="trade.side === 'BUY' ? 'green' : 'red'" size="xs">
                {{ trade.side }}
              </UBadge>
              <span class="font-mono font-semibold">{{ trade.symbol }}</span>
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
  type Trade
} from '~/utils/supabase';
import Chart from 'chart.js/auto';

// State
const isConnected = ref(true);
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

// Table columns
const positionColumns = [
  { key: 'symbol', label: 'Symbol' },
  { key: 'side', label: 'Side' },
  { key: 'entry_price', label: 'Entry Price' },
  { key: 'current_price', label: 'Current Price' },
  { key: 'position_size_usd', label: 'Size ($)' },
  { key: 'unrealized_pnl_usd', label: 'Unrealized P&L' },
  { key: 'time_open', label: 'Time Open' },
];

// Load data
async function loadData() {
  try {
    isConnected.value = true;
    
    // Load all data in parallel
    const [positions, trades, stats] = await Promise.all([
      getOpenPositions(),
      getRecentTrades(20),
      getTodaysStats(),
    ]);

    openPositions.value = positions;
    recentTrades.value = trades;
    todaysStats.value = stats;
  } catch (error) {
    console.error('Error loading data:', error);
    isConnected.value = false;
  }
}

// Load chart data
async function loadChartData() {
  try {
    const data = await getCumulativePnL(chartDays.value);
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
        borderColor: data.length > 0 && data[data.length - 1].cumulative_pnl >= 0 ? '#10b981' : '#ef4444',
        backgroundColor: data.length > 0 && data[data.length - 1].cumulative_pnl >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
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
  await loadData();
  await loadChartData();
  
  // Set up auto-refresh
  refreshInterval = setInterval(loadData, 30000); // 30 seconds
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
  title: 'Sparky Dashboard',
  description: 'Real-time analytics for Sparky trading bot'
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
