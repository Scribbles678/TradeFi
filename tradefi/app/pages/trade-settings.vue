<template>
  <div class="space-y-8 p-6">
    <!-- Header -->
    <div class="flex flex-col gap-2">
      <h1 class="text-3xl font-semibold text-foreground">Trade Settings</h1>
      <p class="text-muted-foreground text-sm">
        Configure how Sparky trades on each exchange. These controls are synced with Supabase and applied by the bot automatically.
      </p>
    </div>

    <!-- Exchange Configuration -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card
        v-for="exchange in exchangeConfigs"
        :key="exchange.key"
      >
        <CardHeader>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Icon :name="exchange.icon" class="w-5 h-5 text-muted-foreground" />
              <CardTitle>{{ exchange.name }}</CardTitle>
              <Badge variant="outline" class="text-xs ml-auto">
                {{ formatAssetClass(exchange.assetClass) }}
              </Badge>
            </div>
            <Badge variant="default" class="text-xs">{{ exchange.status }}</Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-6">

          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <Icon name="i-heroicons-clock" class="w-5 h-5 text-muted-foreground" />
              <div>
                <p class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Trading Window</p>
                <p class="text-xs text-muted-foreground">Tell Sparky when it can enter new positions on this exchange.</p>
              </div>
            </div>
            <div class="rounded-lg border bg-card px-4 py-3 text-sm">
              <div class="flex items-center justify-between mb-2">
                <p class="font-semibold text-foreground">
                  Trading Window
                </p>
              </div>
              <p class="font-mono text-xs mb-2 text-muted-foreground">
                <template v-if="isCryptoExchange(exchange)">
                </template>
                <template v-else-if="isForexExchange(exchange)">
                 
                </template>
                <template v-else>
                </template>
              </p>
              <div class="flex items-center gap-2">
                <Badge variant="default" class="text-xs">
                  {{ getActiveWindow(exchange).title || 'Default' }}
                </Badge>
              </div>
              <!-- Advanced Toggles -->
              <div class="mt-3 pt-3 border-t border-border">
                <!-- Crypto: Pause Weekends Toggle -->
                <div v-if="isCryptoExchange(exchange)" class="flex items-center justify-between toggle-container">
                  <div>
                    <p class="text-xs font-medium text-foreground">Pause on Weekends</p>
                    <p class="text-xs text-muted-foreground">Disable trading on Saturdays and Sundays</p>
                  </div>
                  <div 
                    class="toggle-wrapper"
                    :class="{ 'toggle-on': !exchange.settings.allowWeekends }"
                  >
                    <USwitch
                      :model-value="!exchange.settings.allowWeekends"
                      @update:model-value="(paused: boolean) => toggleCryptoWeekends(exchange, !paused)"
                      color="primary"
                    />
                  </div>
                </div>
                <!-- Forex/Stocks: Extended Hours Toggle -->
                <div v-else-if="isForexExchange(exchange) || isEquitiesExchange(exchange)" class="flex items-center justify-between toggle-container">
                  <div>
                    <p class="text-xs font-medium text-foreground">Extended Hours Trading</p>
                    <p class="text-xs text-muted-foreground">
                      <template v-if="isForexExchange(exchange)">
                        Allow trading on weekends (broker permitting)
                      </template>
                      <template v-else>
                        Allow pre-market and after-hours trading
                      </template>
                    </p>
                  </div>
                  <div 
                    class="toggle-wrapper"
                    :class="{ 'toggle-on': isExtendedTradingEnabled(exchange) }"
                  >
                    <USwitch
                      :model-value="isExtendedTradingEnabled(exchange)"
                      @update:model-value="(value: boolean) => toggleExtendedTrading(exchange, value)"
                      color="primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-3 border-t border-border pt-4">
            <div class="flex items-center gap-2">
              <Icon name="i-heroicons-shield-check" class="w-5 h-5 text-muted-foreground" />
              <div>
                <p class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Risk Controls</p>
                <p class="text-xs text-muted-foreground">Cap daily exposure and define exit rules.</p>
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
          </div>

          <div v-if="exchange.optionsSpecific" class="space-y-4 border-t border-border pt-4">
            <div class="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <Icon name="i-heroicons-adjustments-vertical" class="w-5 h-5" />
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
                <USwitch v-model="exchange.settings.autoCloseOutsideWindow" color="primary" />
              </UFormField>
            </div>
          </div>

        </CardContent>
        <CardFooter>
          <div class="flex items-center justify-between w-full">
            <p class="text-xs text-muted-foreground">
              Last saved: {{ exchange.lastUpdated }}
            </p>
            <div class="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                :disabled="loading"
                @click="resetSettings(exchange.key)"
              >
                Reset
              </Button>
              <Button
                variant="default"
                size="sm"
                :disabled="savingKey === exchange.key"
                @click="saveSettings(exchange.key)"
              >
                <Icon name="i-heroicons-check" class="w-4 h-4 mr-1" />
                Save Settings
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
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
  allowWeekends: boolean
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

// Simplified trading window presets
const tradingWindowPresets: Record<string, { label: string; start: string; end: string; description: string }> = {
  '24/7': {
    label: '24/7 (Always On)',
    start: '00:00',
    end: '23:59',
    description: 'Trade around the clock, including weekends.',
  },
  'market-hours': {
    label: 'Regular Market Hours',
    start: '09:30',
    end: '16:00',
    description: 'NYSE/NASDAQ regular trading hours (9:30 AM - 4:00 PM ET).',
  },
  'forex-hours': {
    label: 'Forex Market Hours',
    start: '00:00',
    end: '23:59',
    description: '24/5 - Weekdays only (Monday-Friday, closes Friday evening).',
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
      tradingHours: 'forex-hours',
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
      tradingHours: 'market-hours',
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
      tradingHours: 'market-hours',
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
    tradingHours: overrides.tradingHours || 'market-hours',
    customWindow: overrides.customWindow
      ? [...overrides.customWindow] as [string, string]
      : [...DEFAULT_WINDOW],
    maxTrades: overrides.maxTrades ?? 0,
    maxPositionSize: overrides.maxPositionSize ?? 0,
    allowWeekends: overrides.allowWeekends ?? false,
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
    exchange.settings.customWindow = [preset.start, preset.end] as [string, string]
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

function getAvailablePresets(exchange: ExchangeConfig) {
  if (isCryptoExchange(exchange)) {
    // Crypto: Only 24/7
    return [{ label: '24/7 (Always On)', value: '24/7' }]
  } else if (isForexExchange(exchange)) {
    // Forex: Market hours only
    return [{ label: 'Forex Market Hours (24/5)', value: 'forex-hours' }]
  } else {
    // Equities/Options: Regular market hours
    return [{ label: 'Regular Market Hours', value: 'market-hours' }]
  }
}

function toggleCryptoWeekends(exchange: ExchangeConfig, allowWeekends: boolean) {
  exchange.settings.allowWeekends = allowWeekends
  // Update trading hours preset based on weekend setting
  if (allowWeekends) {
    exchange.settings.tradingHours = '24/7'
  } else {
    exchange.settings.tradingHours = '24/7' // Still 24/7, but weekends disabled via allowWeekends flag
  }
}

function isExtendedTradingEnabled(exchange: ExchangeConfig): boolean {
  if (isForexExchange(exchange)) {
    // For forex, extended hours = weekend trading
    return exchange.settings.allowWeekends || false
  } else if (isEquitiesExchange(exchange)) {
    // For equities, extended hours = pre-market (7 AM) to after-hours (8 PM)
    // Check if window is extended (7:00-20:00) vs regular (9:30-16:00)
    const window = exchange.settings.customWindow
    return (window[0] === '07:00' && window[1] === '20:00') || exchange.settings.allowWeekends || false
  }
  return false
}

function toggleExtendedTrading(exchange: ExchangeConfig, enabled: boolean) {
  if (isForexExchange(exchange)) {
    // Forex: Extended = weekend trading
    exchange.settings.allowWeekends = enabled
    exchange.settings.tradingHours = 'forex-hours' // Keep base preset
  } else if (isEquitiesExchange(exchange)) {
    // Equities: Extended = pre-market (7 AM) to after-hours (8 PM ET)
    exchange.settings.allowWeekends = enabled // Use this flag to indicate extended hours
    if (enabled) {
      exchange.settings.customWindow = ['07:00', '20:00'] as [string, string]
      exchange.settings.tradingHours = 'market-hours' // Base preset, extended controlled by customWindow
    } else {
      exchange.settings.customWindow = ['09:30', '16:00'] as [string, string]
      exchange.settings.tradingHours = 'market-hours'
    }
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
        allowWeekends: row.allow_weekends ?? target.settings.allowWeekends,
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
      allow_weekends: exchange.settings.allowWeekends,
      position_size_percent: exchange.settings.positionSizePercent,
      strike_tolerance_percent: exchange.settings.strikeTolerancePercent,
      entry_limit_offset_percent: exchange.settings.entryLimitOffsetPercent,
      max_signal_age_sec: exchange.settings.maxSignalAgeSec,
      auto_close_outside_window: exchange.settings.autoCloseOutsideWindow,
      max_open_positions: exchange.settings.maxOpenPositions,
    }

    // RLS will automatically filter by user_id
    // First try to find existing record
    const { data: existing } = await supabase
      .from('trade_settings_exchange')
      .select('id')
      .eq('exchange', exchange.key)
      .single()

    let error
    if (existing) {
      // Update existing record
      const result = await supabase
        .from('trade_settings_exchange')
        .update(payload)
        .eq('id', existing.id)
      error = result.error
    } else {
      // Insert new record
      const result = await supabase
        .from('trade_settings_exchange')
        .insert(payload)
      error = result.error
    }

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

<style scoped>
/* Toggle ON state - Green background with glow */
.toggle-wrapper.toggle-on :deep(button),
.toggle-wrapper.toggle-on :deep([role="switch"]) {
  background-color: var(--color-green-500) !important;
  border-color: var(--color-green-400) !important;
  box-shadow: 0 0 12px 0 var(--color-green-500), 0 4px 24px 0 rgba(16, 185, 129, 0.4) !important;
}

/* Alternative selectors for checked state */
.toggle-wrapper :deep(button[aria-checked="true"]),
.toggle-wrapper :deep([role="switch"][aria-checked="true"]),
.toggle-wrapper :deep(button[data-state="checked"]),
.toggle-wrapper :deep([data-state="checked"]) {
  background-color: var(--color-green-500) !important;
  border-color: var(--color-green-400) !important;
  box-shadow: 0 0 12px 0 var(--color-green-500), 0 4px 24px 0 rgba(16, 185, 129, 0.4) !important;
}

/* Toggle handle when ON - bright white with shadow */
.toggle-wrapper.toggle-on :deep(button > *),
.toggle-wrapper.toggle-on :deep([role="switch"] > *) {
  background-color: white !important;
}

.toggle-wrapper :deep(button[aria-checked="true"] > *),
.toggle-wrapper :deep([role="switch"][aria-checked="true"] > *) {
  background-color: white !important;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.3);
}

/* Toggle OFF state - subtle gray */
.toggle-wrapper:not(.toggle-on) :deep(button),
.toggle-wrapper:not(.toggle-on) :deep([role="switch"]) {
  background-color: rgba(75, 85, 99, 0.5) !important;
  border-color: rgba(107, 114, 128, 0.5) !important;
}

/* Toggle hover glow effect */
.toggle-wrapper:hover :deep(button),
.toggle-wrapper:hover :deep([role="switch"]) {
  box-shadow: 0 0 12px 0 var(--color-gold-400), 0 4px 32px 0 rgba(255, 215, 0, 0.3);
  transition: box-shadow 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
}

.toggle-wrapper.toggle-on:hover :deep(button),
.toggle-wrapper.toggle-on:hover :deep([role="switch"]),
.toggle-wrapper:hover :deep(button[aria-checked="true"]),
.toggle-wrapper:hover :deep([role="switch"][aria-checked="true"]) {
  background-color: var(--color-green-600) !important;
  box-shadow: 0 0 16px 0 var(--color-green-500), 0 6px 32px 0 rgba(16, 185, 129, 0.6) !important;
  border-color: var(--color-green-400) !important;
}

/* Toggle container hover effect */
.toggle-container:hover {
  transform: translateX(2px);
  transition: transform 0.2s ease;
}
</style>

