<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-2">
      <h1 class="text-3xl font-bold">Trade Settings</h1>
      <p class="text-gray-500 dark:text-gray-400">
        Configure how Sparky trades on each exchange. These controls are synced with Supabase and applied by the bot automatically.
      </p>
    </div>

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
              <h3 class="text-lg font-semibold">{{ exchange.name }}</h3>
              <UBadge color="neutral" variant="outline" size="xs" class="ml-auto">
                {{ formatAssetClass(exchange.assetClass) }}
              </UBadge>
            </div>
            <UBadge color="primary" variant="soft">{{ exchange.status }}</UBadge>
          </div>
        </template>

        <div class="space-y-6">
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-clock" class="w-5 h-5 text-blue-400" />
              <div>
                <p class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Trading Window</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Tell Sparky when it can enter new positions on this exchange.</p>
              </div>
            </div>
            <div class="rounded-xl border border-blue-500/30 bg-blue-600/5 px-4 py-3 text-sm text-blue-100 flex items-center justify-between">
              <div>
                <p class="font-semibold text-blue-200">
                  Default Window
                </p>
                <p class="font-mono text-xs">
                  <template v-if="isCryptoExchange(exchange)">
                    24/7
                  </template>
                  <template v-else>
                    {{ getActiveWindow(exchange).start }} → {{ getActiveWindow(exchange).end }} (local time)
                  </template>
                </p>
              </div>
              <div v-if="isCryptoExchange(exchange)" class="flex items-center gap-2 text-xs">
                <span>Pause Weekends</span>
                <USwitch
                  :model-value="!exchange.settings.allowWeekends"
                  color="primary"
                  on-color="primary"
                  @update:model-value="toggleCryptoWeekends(exchange, $event)"
                />
              </div>
              <div v-else class="flex items-center gap-2 text-xs">
                <span>Extended Hours</span>
                <USwitch
                  :model-value="isExtendedTrading(exchange)"
                  color="primary"
                  on-color="primary"
                  @update:model-value="toggleExtendedTrading(exchange, $event)"
                />
              </div>
            </div>
          </div>

          <div class="space-y-3 border-t border-gray-200 dark:border-gray-800 pt-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-emerald-400" />
              <div>
                <p class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Risk Controls</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Cap daily exposure and define exit rules.</p>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="Max Trades per Day" help="0 = unlimited. Sparky stops opening new positions after this count.">
                <UInput v-model.number="exchange.settings.maxTrades" type="number" min="0" placeholder="e.g. 5" />
              </UFormField>
              <UFormField label="Max Position Size (USD)" help="Largest single position size. 0 lets Sparky auto-size.">
                <UInput v-model.number="exchange.settings.maxPositionSize" type="number" min="0" step="50" placeholder="e.g. 1000" />
              </UFormField>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="Take Profit Target (%)" help="Percent gain that triggers profit-taking.">
                <UInput v-model.number="exchange.settings.takeProfit" type="number" min="0" step="0.1" placeholder="e.g. 2" />
              </UFormField>
              <UFormField label="Stop Loss Limit (%)" help="Percent drawdown where Sparky exits the trade.">
                <UInput v-model.number="exchange.settings.stopLoss" type="number" min="0" step="0.1" placeholder="e.g. 1" />
              </UFormField>
            </div>
          </div>

          <div v-if="exchange.optionsSpecific" class="space-y-4 border-t border-gray-200 dark:border-gray-800 pt-4">
            <div class="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
              <UIcon name="i-heroicons-adjustments-vertical" class="w-5 h-5" />
              Options Controls
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="Position Size (% buying power)">
                <UInput v-model.number="exchange.settings.positionSizePercent" type="number" min="1" />
              </UFormField>
              <UFormField label="Strike Tolerance (%)">
                <UInput v-model.number="exchange.settings.strikeTolerancePercent" type="number" min="0.1" step="0.1" />
              </UFormField>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="Entry Limit Offset (%)" help="How far above the ask to place entry orders.">
                <UInput v-model.number="exchange.settings.entryLimitOffsetPercent" type="number" min="0.1" step="0.1" />
              </UFormField>
              <UFormField label="Max Signal Age (sec)">
                <UInput v-model.number="exchange.settings.maxSignalAgeSec" type="number" min="1" />
              </UFormField>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="Max Open Positions per Symbol">
                <UInput v-model.number="exchange.settings.maxOpenPositions" type="number" min="1" />
              </UFormField>
              <UFormField label="Auto Close Outside Window">
                <USwitch v-model="exchange.settings.autoCloseOutsideWindow" color="primary" on-color="primary" />
              </UFormField>
            </div>
          </div>

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
import { useSupabaseClient } from '~/utils/supabase'

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

const DEFAULT_WINDOW: [string, string] = ['00:00', '23:59']

const tradingWindowPresets: Record<string, { label: string; start: string; end: string; description: string }> = {
  '24/5': {
    label: '24/5 (Weekdays Only)',
    start: '00:00',
    end: '23:59',
    description: 'Continuous Monday–Friday trading. Typical forex broker schedule.',
  },
  '24/7': {
    label: '24/7 (Always On)',
    start: '00:00',
    end: '23:59',
    description: 'Never stop trading. Ideal for crypto bots that operate around the clock.',
  },
  'forex-extended': {
    label: 'Extended Forex Hours',
    start: '00:00',
    end: '23:59',
    description: 'Enable weekend entries for forex strategies (broker permitting).',
  },
  'ny-session': {
    label: 'NYSE Regular Session',
    start: '09:30',
    end: '16:00',
    description: 'Align entries with U.S. equity market hours (Eastern Time).',
  },
  'stocks-extended': {
    label: 'Extended Equity Hours',
    start: '07:00',
    end: '20:00',
    description: 'Allow pre-market and after-hours participation.',
  },
  weekend: {
    label: 'Weekends Only',
    start: '00:00',
    end: '23:59',
    description: 'Restrict entries to Saturdays and Sundays for niche strategies.',
  },
  'london-session': {
    label: 'London Session',
    start: '08:00',
    end: '17:00',
    description: 'European market hours (UTC).',
  },
}

const toast = useToast()

const loading = ref(false)
const savingKey = ref('')

const supabase = useSupabaseClient()

const defaultExchanges: Record<ExchangeKey, ExchangeConfig> = {
  aster: {
    key: 'aster',
    name: 'Aster DEX',
    icon: 'i-simple-icons-bitcoin',
    assetClass: 'Crypto Futures',
    status: 'Live',
    lastUpdated: 'Not saved',
    settings: buildDefaultSettings({
      tradingHours: '24/7',
      customWindow: ['00:00', '23:59'],
      allowWeekends: true,
    }),
  },
  oanda: {
    key: 'oanda',
    name: 'OANDA',
    icon: 'i-heroicons-currency-dollar',
    assetClass: 'Forex',
    status: 'Live',
    lastUpdated: 'Not saved',
    settings: buildDefaultSettings({
      tradingHours: '24/5',
      customWindow: ['00:00', '23:59'],
      allowWeekends: false,
    }),
  },
  tradier: {
    key: 'tradier',
    name: 'Tradier (Equities)',
    icon: 'i-heroicons-chart-bar',
    assetClass: 'Stocks',
    status: 'Paper Trading',
    lastUpdated: 'Not saved',
    settings: buildDefaultSettings({
      tradingHours: 'ny-session',
      customWindow: ['09:30', '16:00'],
      allowWeekends: false,
    }),
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
      customWindow: ['09:30', '16:00'],
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

function getPresetInfo(value: string) {
  return tradingWindowPresets[value]
}

function applyTradingPreset(exchange: ExchangeConfig, presetKey: string) {
  const preset = getPresetInfo(presetKey)
  exchange.settings.tradingHours = presetKey
  if (preset) {
    exchange.settings.customWindow = [preset.start, preset.end]
  }
}

function isCryptoExchange(exchange: ExchangeConfig) {
  return exchange.assetClass.toLowerCase().includes('crypto')
}

function isForexExchange(exchange: ExchangeConfig) {
  return exchange.assetClass.toLowerCase().includes('forex')
}

function isEquitiesExchange(exchange: ExchangeConfig) {
  const lower = exchange.assetClass.toLowerCase()
  return lower.includes('stocks') || lower.includes('options')
}

function formatAssetClass(label: string) {
  return label?.toUpperCase() || 'UNKNOWN'
}

function getActiveWindow(exchange: ExchangeConfig) {
  const preset = getPresetInfo(exchange.settings.tradingHours)
  return {
    title: preset?.label || 'Custom Window',
    description: preset?.description || 'Custom trading hours configured in Supabase.',
    start: preset?.start || exchange.settings.customWindow[0],
    end: preset?.end || exchange.settings.customWindow[1],
  }
}

function toggleCryptoWeekends(exchange: ExchangeConfig, pauseWeekends: boolean) {
  exchange.settings.allowWeekends = !pauseWeekends
  applyTradingPreset(exchange, pauseWeekends ? '24/5' : '24/7')
}

function isExtendedTrading(exchange: ExchangeConfig) {
  return exchange.settings.tradingHours === 'forex-extended' || exchange.settings.tradingHours === 'stocks-extended'
}

function toggleExtendedTrading(exchange: ExchangeConfig, enabled: boolean) {
  if (isForexExchange(exchange)) {
    applyTradingPreset(exchange, enabled ? 'forex-extended' : '24/5')
    exchange.settings.allowWeekends = enabled
  } else if (isEquitiesExchange(exchange)) {
    applyTradingPreset(exchange, enabled ? 'stocks-extended' : 'ny-session')
  }
}

async function loadSettings() {
  loading.value = true
  try {
    await loadExchangeSettings()
    toast.add({ title: 'Settings refreshed', icon: 'i-heroicons-check-circle', color: 'success' })
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Failed to load settings', description: String(error), color: 'error' })
  } finally {
    loading.value = false
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
    toast.add({ title: `Settings saved for ${exchange.name}`, color: 'success' })
  } catch (error) {
    console.error(error)
    toast.add({
      title: `Failed to save settings for ${exchangeKey}`,
      description: String(error),
      color: 'error',
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

onMounted(loadSettings)

definePageMeta({
  title: 'Trade Settings',
  description: 'Configure Sparky trading parameters per exchange.',
})
</script>

