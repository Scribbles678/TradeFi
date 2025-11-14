<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-2">
      <h1 class="text-3xl font-bold">Trade Settings</h1>
      <p class="text-gray-500 dark:text-gray-400">
        Configure how Sparky trades on each exchange. These controls are synced with Supabase and applied by the bot automatically.
      </p>
      <UAlert
        v-if="!globalSettingsSynced"
        icon="i-heroicons-light-bulb"
        title="Defaults in effect"
        description="Global settings have not been saved yet; Sparky is using built-in defaults."
        color="warning"
        variant="soft"
      />
    </div>

    <!-- Global Settings Summary -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5" />
            <h3 class="text-lg font-semibold">Global Trading Controls</h3>
          </div>
          <UBadge :color="globalSettingsSynced ? 'primary' : 'warning'">
            {{ globalSettingsSynced ? 'Live' : 'Default' }}
          </UBadge>
        </div>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div class="space-y-1">
          <p class="text-gray-500 dark:text-gray-400">Default Max Trades / Day</p>
          <p class="text-xl font-semibold">{{ globalSettings.maxTradesDisplay }}</p>
        </div>
        <div class="space-y-1">
          <p class="text-gray-500 dark:text-gray-400">Default Max Position Size</p>
          <p class="text-xl font-semibold">{{ globalSettings.maxPositionSizeDisplay }}</p>
        </div>
        <div class="space-y-1">
          <p class="text-gray-500 dark:text-gray-400">Default TP / SL</p>
          <p class="text-xl font-semibold">{{ globalSettings.tpSlDisplay }}</p>
        </div>
      </div>
      <template #footer>
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            These defaults apply when an exchange doesn't have overrides saved.
          </p>
          <div class="flex gap-2">
            <UButton icon="i-heroicons-arrow-path" label="Reload" variant="ghost" size="sm" :loading="loading" @click="loadSettings" />
            <UButton icon="i-heroicons-pencil" label="Edit Global Defaults" variant="outline" size="sm" @click="openGlobalSettings" />
          </div>
        </div>
      </template>
    </UCard>

    <!-- Exchange Configuration -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <UCard
        v-for="exchange in exchangeConfigs"
        :key="exchange.key"
        class="space-y-4"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <UIcon :name="exchange.icon" class="w-6 h-6" />
              <div>
                <h3 class="text-lg font-semibold">{{ exchange.name }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ exchange.assetClass }}</p>
              </div>
            </div>
            <UBadge color="primary" variant="soft">{{ exchange.status }}</UBadge>
          </div>
        </template>

        <div class="space-y-4">
          <UFormGroup label="Allowed Trading Hours" help="Use presets or switch to manual custom window.">
            <div class="space-y-2">
              <USelect
                v-model="exchange.settings.tradingHours"
                :options="tradingHourOptions"
                placeholder="Select trading window"
              />
              <div v-if="exchange.settings.tradingHours === 'custom'" class="grid grid-cols-2 gap-2">
                <UInput v-model="exchange.settings.customWindow[0]" placeholder="Start HH:MM" />
                <UInput v-model="exchange.settings.customWindow[1]" placeholder="End HH:MM" />
              </div>
            </div>
          </UFormGroup>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormGroup label="Max Trades per Day" help="0 = unlimited">
              <UInput v-model.number="exchange.settings.maxTrades" type="number" min="0" placeholder="e.g. 5" />
            </UFormGroup>
            <UFormGroup label="Max Position Size (USD)" help="0 = auto sized">
              <UInput v-model.number="exchange.settings.maxPositionSize" type="number" min="0" step="50" placeholder="e.g. 1000" />
            </UFormGroup>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormGroup label="Take Profit Target (%)" help="Percentage gain to exit winners.">
              <UInput v-model.number="exchange.settings.takeProfit" type="number" min="0" step="0.1" placeholder="e.g. 2" />
            </UFormGroup>
            <UFormGroup label="Stop Loss Target (%)" help="Percentage loss to cut losers.">
              <UInput v-model.number="exchange.settings.stopLoss" type="number" min="0" step="0.1" placeholder="e.g. 1" />
            </UFormGroup>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormGroup label="Allow Weekends">
              <UToggle v-model="exchange.settings.allowWeekends" />
            </UFormGroup>
            <UFormGroup label="Enable News Filter">
              <UToggle v-model="exchange.settings.newsFilter" />
            </UFormGroup>
          </div>

          <div v-if="exchange.optionsSpecific" class="space-y-4 border-t border-gray-200 dark:border-gray-800 pt-4">
            <div class="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
              <UIcon name="i-heroicons-adjustments-vertical" class="w-5 h-5" />
              Options Controls
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup label="Position Size (% buying power)">
                <UInput v-model.number="exchange.settings.positionSizePercent" type="number" min="1" />
              </UFormGroup>
              <UFormGroup label="Strike Tolerance (%)">
                <UInput v-model.number="exchange.settings.strikeTolerancePercent" type="number" min="0.1" step="0.1" />
              </UFormGroup>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup label="Entry Limit Offset (%)" help="How far above the ask to place entry orders.">
                <UInput v-model.number="exchange.settings.entryLimitOffsetPercent" type="number" min="0.1" step="0.1" />
              </UFormGroup>
              <UFormGroup label="Max Signal Age (sec)">
                <UInput v-model.number="exchange.settings.maxSignalAgeSec" type="number" min="1" />
              </UFormGroup>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup label="Max Open Positions per Symbol">
                <UInput v-model.number="exchange.settings.maxOpenPositions" type="number" min="1" />
              </UFormGroup>
              <UFormGroup label="Auto Close Outside Window">
                <UToggle v-model="exchange.settings.autoCloseOutsideWindow" />
              </UFormGroup>
            </div>
          </div>

          <UFormGroup label="Notes">
            <UTextarea
              v-model="exchange.settings.notes"
              placeholder="Add reminders or special instructions..."
              :rows="3"
            />
          </UFormGroup>
        </div>

        <template #footer>
          <div class="flex items-center justify-between">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Last saved: {{ exchange.lastUpdated }}
            </p>
            <div class="flex gap-2">
              <UButton
                label="Reset"
                variant="ghost"
                size="sm"
                :disabled="loading"
                @click="resetSettings(exchange.key)"
              />
              <UButton
                label="Save Settings"
                icon="i-heroicons-check"
                size="sm"
                class="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                :loading="savingKey === exchange.key"
                @click="saveSettings(exchange.key)"
              />
            </div>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '~/utils/supabase'

type ExchangeKey = 'aster' | 'oanda' | 'tradier' | 'tradier_options'

interface ExchangeSettings {
  tradingHours: string
  customWindow: [string, string]
  maxTrades: number
  maxPositionSize: number
  takeProfit: number
  stopLoss: number
  allowWeekends: boolean
  newsFilter: boolean
  notes: string
  positionSizePercent: number
  strikeTolerancePercent: number
  entryLimitOffsetPercent: number
  maxSignalAgeSec: number
  maxOpenPositions: number
  autoCloseOutsideWindow: boolean
}

interface ExchangeConfig {
  key: ExchangeKey
  name: string
  icon: string
  assetClass: string
  status: string
  optionsSpecific?: boolean
  lastUpdated: string
  settings: ExchangeSettings
}

interface GlobalSettingsSummary {
  maxTradesDisplay: string
  maxPositionSizeDisplay: string
  tpSlDisplay: string
}

const DEFAULT_WINDOW: [string, string] = ['00:00', '23:59']

const tradingHourOptions = [
  { label: '24/5 (Default)', value: '24/5' },
  { label: 'Custom Session (NYSE)', value: 'ny-session' },
  { label: 'Custom Session (London)', value: 'london-session' },
  { label: 'Weekends Only (Crypto)', value: 'weekend' },
  { label: 'Manual Custom Window', value: 'custom' },
]

const toast = useToast()

const loading = ref(false)
const savingKey = ref('')
const globalSettingsSynced = ref(false)
const globalSettings = ref<GlobalSettingsSummary>({
  maxTradesDisplay: 'Unlimited',
  maxPositionSizeDisplay: '$0',
  tpSlDisplay: '0% / 0%',
})

const defaultExchanges: Record<ExchangeKey, ExchangeConfig> = {
  aster: {
    key: 'aster',
    name: 'Aster DEX',
    icon: 'i-simple-icons-bitcoin',
    assetClass: 'Crypto Futures',
    status: 'Live',
    lastUpdated: 'Not saved',
    settings: buildDefaultSettings({ allowWeekends: true }),
  },
  oanda: {
    key: 'oanda',
    name: 'OANDA',
    icon: 'i-heroicons-currency-dollar',
    assetClass: 'Forex',
    status: 'Live',
    lastUpdated: 'Not saved',
    settings: buildDefaultSettings({ tradingHours: 'ny-session' }),
  },
  tradier: {
    key: 'tradier',
    name: 'Tradier (Equities)',
    icon: 'i-heroicons-chart-bar',
    assetClass: 'Stocks',
    status: 'Paper Trading',
    lastUpdated: 'Not saved',
    settings: buildDefaultSettings({ tradingHours: 'ny-session' }),
  },
  tradier_options: {
    key: 'tradier_options',
    name: 'Tradier Options',
    icon: 'i-heroicons-adjustments-vertical',
    assetClass: 'Options',
    status: 'Paper Trading',
    optionsSpecific: true,
    lastUpdated: 'Not saved',
    settings: buildDefaultSettings({
      tradingHours: 'ny-session',
      positionSizePercent: 20,
      strikeTolerancePercent: 1,
      entryLimitOffsetPercent: 1,
      maxSignalAgeSec: 10,
      maxOpenPositions: 3,
      autoCloseOutsideWindow: true,
    }),
  },
}

const exchangeConfigs = ref<ExchangeConfig[]>(
  Object.values(defaultExchanges).map((cfg) => ({
    ...cfg,
    settings: { ...cfg.settings, customWindow: [...cfg.settings.customWindow] as [string, string] },
  }))
)

function buildDefaultSettings(overrides: Partial<ExchangeSettings> = {}): ExchangeSettings {
  return {
    tradingHours: overrides.tradingHours || '24/5',
    customWindow: overrides.customWindow
      ? [...overrides.customWindow] as [string, string]
      : [...DEFAULT_WINDOW],
    maxTrades: overrides.maxTrades ?? 0,
    maxPositionSize: overrides.maxPositionSize ?? 0,
    takeProfit: overrides.takeProfit ?? 0,
    stopLoss: overrides.stopLoss ?? 0,
    allowWeekends: overrides.allowWeekends ?? false,
    newsFilter: overrides.newsFilter ?? false,
    notes: overrides.notes || '',
    positionSizePercent: overrides.positionSizePercent ?? 0,
    strikeTolerancePercent: overrides.strikeTolerancePercent ?? 1,
    entryLimitOffsetPercent: overrides.entryLimitOffsetPercent ?? 1,
    maxSignalAgeSec: overrides.maxSignalAgeSec ?? 10,
    maxOpenPositions: overrides.maxOpenPositions ?? 0,
    autoCloseOutsideWindow: overrides.autoCloseOutsideWindow ?? true,
  }
}

function parseTradingWindow(value: any): [string, string] {
  if (!value) return [...DEFAULT_WINDOW]
  if (Array.isArray(value) && value.length === 2) return [value[0], value[1]]
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed) && parsed.length === 2) {
      return [parsed[0], parsed[1]]
    }
  } catch {
    // ignore parsing issues
  }
  return [...DEFAULT_WINDOW]
}

async function loadSettings() {
  loading.value = true
  try {
    await Promise.all([loadGlobalSettings(), loadExchangeSettings()])
    toast.add({ title: 'Settings refreshed', icon: 'i-heroicons-check-circle', color: 'green' })
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Failed to load settings', description: String(error), color: 'red' })
  } finally {
    loading.value = false
  }
}

async function loadGlobalSettings() {
  const { data, error } = await supabase
    .from('trade_settings_global')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error

  if (data) {
    globalSettingsSynced.value = true
    globalSettings.value = {
      maxTradesDisplay: data.max_trades_per_day ? String(data.max_trades_per_day) : 'Unlimited',
      maxPositionSizeDisplay: data.max_position_size_usd
        ? formatCurrency(data.max_position_size_usd)
        : '$0',
      tpSlDisplay: `${data.take_profit_percent ?? 0}% / ${data.stop_loss_percent ?? 0}%`,
    }
  } else {
    globalSettingsSynced.value = false
    globalSettings.value = {
      maxTradesDisplay: 'Unlimited',
      maxPositionSizeDisplay: '$0',
      tpSlDisplay: '0% / 0%',
    }
  }
}

async function loadExchangeSettings() {
  const { data, error } = await supabase.from('trade_settings_exchange').select('*')
  if (error) throw error

  const configs = Object.values(defaultExchanges).map((cfg) => ({
    ...cfg,
    settings: { ...cfg.settings, customWindow: [...cfg.settings.customWindow] as [string, string] },
  }))

  if (data && Array.isArray(data)) {
    data.forEach((row) => {
      const key = row.exchange as ExchangeKey
      const target = configs.find((cfg) => cfg.key === key)
      if (!target) return

      target.lastUpdated = row.updated_at
        ? new Date(row.updated_at).toLocaleString()
        : 'Not saved'

      target.settings = {
        tradingHours: row.trading_hours_preset || target.settings.tradingHours,
        customWindow: parseTradingWindow(row.trading_window),
        maxTrades: row.max_trades_per_day ?? target.settings.maxTrades,
        maxPositionSize: Number(row.max_position_size_usd) || 0,
        takeProfit: Number(row.take_profit_percent) || 0,
        stopLoss: Number(row.stop_loss_percent) || 0,
        allowWeekends: row.allow_weekends ?? target.settings.allowWeekends,
        newsFilter: row.news_filter ?? target.settings.newsFilter,
        notes: row.notes || '',
        positionSizePercent: Number(row.position_size_percent) || target.settings.positionSizePercent,
        strikeTolerancePercent:
          Number(row.strike_tolerance_percent) || target.settings.strikeTolerancePercent,
        entryLimitOffsetPercent:
          Number(row.entry_limit_offset_percent) || target.settings.entryLimitOffsetPercent,
        maxSignalAgeSec: row.max_signal_age_sec ?? target.settings.maxSignalAgeSec,
        maxOpenPositions: row.max_open_positions ?? target.settings.maxOpenPositions,
        autoCloseOutsideWindow:
          row.auto_close_outside_window ?? target.settings.autoCloseOutsideWindow,
      }
    })
  }

  exchangeConfigs.value = configs
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

async function saveSettings(exchangeKey: ExchangeKey) {
  const exchange = exchangeConfigs.value.find((cfg) => cfg.key === exchangeKey)
  if (!exchange) return

  savingKey.value = exchangeKey
  try {
    const payload = {
      exchange: exchange.key,
      trading_hours_preset: exchange.settings.tradingHours,
      trading_window: exchange.settings.customWindow,
      max_trades_per_day: exchange.settings.maxTrades,
      max_position_size_usd: exchange.settings.maxPositionSize,
      take_profit_percent: exchange.settings.takeProfit,
      stop_loss_percent: exchange.settings.stopLoss,
      allow_weekends: exchange.settings.allowWeekends,
      news_filter: exchange.settings.newsFilter,
      notes: exchange.settings.notes || null,
      position_size_percent: exchange.settings.positionSizePercent,
      strike_tolerance_percent: exchange.settings.strikeTolerancePercent,
      entry_limit_offset_percent: exchange.settings.entryLimitOffsetPercent,
      tp_percent: exchange.settings.takeProfit,
      sl_percent: exchange.settings.stopLoss,
      max_signal_age_sec: exchange.settings.maxSignalAgeSec,
      auto_close_outside_window: exchange.settings.autoCloseOutsideWindow,
      max_open_positions: exchange.settings.maxOpenPositions,
    }

    const { error } = await supabase
      .from('trade_settings_exchange')
      .upsert(payload, { onConflict: 'exchange' })

    if (error) throw error

    exchange.lastUpdated = new Date().toLocaleString()
    toast.add({ title: `Settings saved for ${exchange.name}`, color: 'green' })
  } catch (error) {
    console.error(error)
    toast.add({
      title: `Failed to save settings for ${exchangeKey}`,
      description: String(error),
      color: 'red',
    })
  } finally {
    savingKey.value = ''
  }
}

async function resetSettings(exchangeKey: ExchangeKey) {
  const confirmed = confirm('Reset settings to defaults for this exchange?')
  if (!confirmed) return

  const defaults = defaultExchanges[exchangeKey]
  const target = exchangeConfigs.value.find((cfg) => cfg.key === exchangeKey)
  if (!defaults || !target) return

  target.settings = {
    ...buildDefaultSettings(defaults.settings),
    customWindow: [...defaults.settings.customWindow] as [string, string],
  }

  await saveSettings(exchangeKey)
}

function openGlobalSettings() {
  alert('Global settings modal coming soon!')
}

onMounted(loadSettings)

definePageMeta({
  title: 'Trade Settings',
  description: 'Configure Sparky trading parameters per exchange.',
})
</script>

