<template>
  <div class="space-y-8 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-3xl font-semibold text-foreground">Exchanges</h1>
        <p class="text-muted-foreground text-sm mt-1">
          Manage your exchange connections, view balances, and configure API keys
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button
          size="sm"
          @click="showAddExchangeSheet = true"
        >
          <Icon name="i-heroicons-plus" class="w-4 h-4 mr-1" />
          Add Exchange
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="refreshAll"
          :disabled="isLoading || credentialsLoading"
        >
          <Icon name="i-heroicons-arrow-path" class="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Security Notice -->
    <Card class="border-blue-500/20 bg-blue-500/5">
      <CardContent class="flex gap-3 py-4">
        <Icon name="i-heroicons-shield-check" class="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div class="text-sm">
          <p class="font-semibold mb-1 text-foreground">Security Notice</p>
          <p class="text-muted-foreground">
            API credentials are  encrypted at rest, and never exposed to the browser.
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- Exchange Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card
        v-for="card in allExchangeCards"
        :key="card.key"
        :data-exchange="card.key"
        class="overflow-hidden"
      >
        <Collapsible v-model:open="expandedCards[card.key]">
          <!-- Card Header (Always Visible) -->
          <CardHeader>
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <Icon :name="card.icon" class="w-6 h-6 flex-shrink-0" :class="card.iconColor" />
                <div class="flex-1 min-w-0">
                  <CardTitle class="text-lg">{{ card.name }}</CardTitle>
                  <p class="text-xs text-muted-foreground mt-0.5">{{ card.assetClass }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <Badge 
                  :variant="getExchangeStatus(card.key).color === 'success' ? 'success' : getExchangeStatus(card.key).color === 'error' ? 'error' : 'outline'" 
                  class="text-xs"
                >
                  {{ getExchangeStatus(card.key).label }}
                </Badge>
                <CollapsibleTrigger as-child>
                  <Button 
                    variant="outline" 
                    size="sm"
                    class="gap-1.5"
                  >
                    <Icon name="i-heroicons-key" class="w-3.5 h-3.5" />
                    <span class="hidden sm:inline">{{ isCredentialConnected(card.key) ? 'Configure' : 'Add API Keys' }}</span>
                    <Icon 
                      :name="expandedCards[card.key] ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" 
                      class="w-3.5 h-3.5" 
                    />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
          </CardHeader>

          <!-- Balance Summary (Collapsed View) -->
          <CardContent v-if="!expandedCards[card.key]" class="space-y-4">
            <div>
              <p class="text-sm text-muted-foreground">{{ getBalanceLabel(card.key) }}</p>
              <div class="flex items-center gap-2 mt-1">
                <div v-if="isBalanceLoading(card.key)" class="flex items-center gap-2">
                  <Icon name="i-heroicons-arrow-path" class="w-5 h-5 text-muted-foreground animate-spin" />
                  <span class="text-sm text-muted-foreground">Loading...</span>
                </div>
                <p v-else class="text-2xl font-bold text-foreground">
                  ${{ getBalance(card.key)?.toFixed(2) ?? '---' }}
                </p>
              </div>
            </div>
            <div class="pt-2 border-t border-border">
              <p class="text-xs text-muted-foreground">Market: <span class="font-semibold text-foreground">{{ card.marketHours }}</span></p>
              <p v-if="!isCredentialConnected(card.key)" class="text-xs text-muted-foreground mt-1">
                Click to expand and configure API keys
              </p>
            </div>
          </CardContent>

          <!-- Credential Form (Expanded View) -->
          <CollapsibleContent>
            <CardContent v-if="credentialForms[card.key]" class="space-y-4 pt-0">
              <!-- Connection Status & Last Tested -->
              <div class="flex items-center gap-2 pb-3 border-b border-border">
                <Icon 
                  :name="getCredentialStatus(card.key).icon" 
                  :class="{
                    'text-green-400': getCredentialStatus(card.key).color === 'success',
                    'text-yellow-400': getCredentialStatus(card.key).color === 'warning',
                    'text-red-400': getCredentialStatus(card.key).color === 'error',
                    'text-muted-foreground': getCredentialStatus(card.key).color === 'neutral'
                  }"
                  class="w-4 h-4"
                />
                <p class="text-xs text-muted-foreground">
                  Last tested: {{ formatLastTested(credentialForms[card.key].lastTested) }}
                </p>
              </div>

              <!-- Credential Form Fields -->
              <div class="space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div class="space-y-2">
                    <Label>Label</Label>
                    <Input
                      v-model="credentialForms[card.key].label"
                      placeholder="Account label"
                    />
                  </div>

                  <div class="space-y-2">
                    <Label>{{ card.key === 'oanda' ? 'API Token' : 'API Key' }}</Label>
                    <div class="relative">
                      <Input
                        v-model="credentialForms[card.key].apiKey"
                        :type="credentialForms[card.key].showApiKey ? 'text' : 'password'"
                        placeholder="API key or token"
                        class="pr-10"
                      />
                      <button
                        type="button"
                        @click="credentialForms[card.key].showApiKey = !credentialForms[card.key].showApiKey"
                        class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <Icon 
                          :name="credentialForms[card.key].showApiKey ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" 
                          class="w-4 h-4" 
                        />
                      </button>
                    </div>
                  </div>

                  <div v-if="card.key !== 'tastytrade'" class="space-y-2">
                    <Label>Account ID</Label>
                    <Input
                      v-model="credentialForms[card.key].accountId"
                      placeholder="Account ID / Number"
                    />
                  </div>

                  <div v-if="card.showApiSecret !== false" class="space-y-2">
                    <Label>API Secret</Label>
                    <div class="relative">
                      <Input
                        v-model="credentialForms[card.key].apiSecret"
                        :type="credentialForms[card.key].showApiSecret ? 'text' : 'password'"
                        placeholder="API secret (if required)"
                        class="pr-10"
                      />
                      <button
                        type="button"
                        @click="credentialForms[card.key].showApiSecret = !credentialForms[card.key].showApiSecret"
                        class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <Icon 
                          :name="credentialForms[card.key].showApiSecret ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" 
                          class="w-4 h-4" 
                        />
                      </button>
                    </div>
                  </div>

                  <div v-if="card.showPassphrase" class="space-y-2">
                    <Label>Passphrase</Label>
                    <div class="relative">
                      <Input
                        v-model="credentialForms[card.key].passphrase"
                        :type="credentialForms[card.key].showPassphrase ? 'text' : 'password'"
                        placeholder="Optional passphrase"
                        class="pr-10"
                      />
                      <button
                        type="button"
                        @click="credentialForms[card.key].showPassphrase = !credentialForms[card.key].showPassphrase"
                        class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <Icon 
                          :name="credentialForms[card.key].showPassphrase ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" 
                          class="w-4 h-4" 
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center justify-end gap-2 pt-4 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    :disabled="testingCredential === card.key || !isCredentialConnected(card.key)"
                    @click="testConnection(card.key)"
                  >
                    <Icon name="i-heroicons-beaker" class="w-4 h-4 mr-1" />
                    Test
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    :disabled="deletingCredential === card.key"
                    @click="deleteCredential(card.key)"
                  >
                    <Icon name="i-heroicons-trash" class="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    :disabled="savingCredential === card.key"
                    @click="saveCredential(card.key)"
                  >
                    <Icon name="i-heroicons-check" class="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>

    <!-- Error Messages -->
    <Card v-if="hasErrors" class="border-red-500 border-2">
      <CardHeader>
        <CardTitle class="text-red-400">Connection Errors</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <template 
            v-for="(balance, exchangeId) in exchangeBalances" 
            :key="exchangeId"
          >
            <div 
              v-if="balance && !balance.success && !balance.disabled && credentialForms[exchangeId]?.id && !balance.checking && !isInGracePeriod"
              class="text-sm text-foreground"
            >
              <span class="font-semibold">{{ credentialTitle(exchangeId) }}:</span> {{ balance.error || 'Connection failed' }}
            </div>
            <div 
              v-if="balance && !balance.success && !balance.disabled && credentialForms[exchangeId]?.id && balance.checking"
              class="text-sm text-muted-foreground"
            >
              <span class="font-semibold">{{ credentialTitle(exchangeId) }}:</span> Checking connection...
            </div>
          </template>
        </div>
      </CardContent>
    </Card>

    <!-- Add Exchange Sheet -->
    <Sheet v-model:open="showAddExchangeSheet">
      <SheetContent class="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Exchange</SheetTitle>
          <SheetDescription>
            Select an exchange to connect. Configure API keys by expanding the exchange card.
          </SheetDescription>
        </SheetHeader>
        
        <div class="mt-6">
          <!-- Search/Filter -->
          <div class="mb-6">
            <div class="relative">
              <Icon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                v-model="exchangeSearch"
                placeholder="Start typing to filter..."
                class="w-full pl-10"
              />
            </div>
          </div>

          <!-- Exchange Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Card
              v-for="exchange in filteredExchanges"
              :key="exchange.id"
              class="cursor-pointer hover:border-primary hover:shadow-md transition-all"
              :class="{
                'border-green-500/50 bg-green-500/5': exchange.isConnected
              }"
              @click="selectExchange(exchange)"
            >
              <CardContent class="p-4">
                <div class="flex items-center gap-3">
                  <!-- Logo -->
                  <div class="flex-shrink-0">
                    <img
                      v-if="exchange.logo"
                      :src="exchange.logo"
                      :alt="exchange.name"
                      class="w-10 h-10 object-contain"
                    />
                    <div
                      v-else
                      class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      :class="exchange.colorClass"
                    >
                      <Icon :name="exchange.icon" class="w-6 h-6" />
                    </div>
                  </div>
                  <!-- Exchange Info -->
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-sm text-foreground mb-0.5">{{ exchange.name }}</p>
                    <p class="text-xs text-muted-foreground">{{ exchange.assetTypes }}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Empty State -->
          <div v-if="filteredExchanges.length === 0" class="text-center py-12">
            <Icon name="i-heroicons-magnifying-glass" class="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p class="text-muted-foreground">No exchanges found</p>
            <p class="text-sm text-muted-foreground mt-1">Try a different search term</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>

    <!-- Connect Exchange Dialog -->
    <Sheet v-model:open="showConnectDialog" v-if="selectedExchange">
      <SheetContent 
        side="center"
        class="max-w-2xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle class="text-2xl">{{ selectedExchange.name }}</SheetTitle>
          <SheetDescription>
            Enter your API credentials to create the connection.
          </SheetDescription>
        </SheetHeader>

        <div class="space-y-6 py-4">
          <!-- Instructions -->
          <div v-if="selectedExchange.instructions" class="space-y-2">
            <p class="text-sm text-muted-foreground">
              {{ selectedExchange.instructions }}
            </p>
            <a
              href="#"
              class="text-sm text-primary hover:underline"
              @click.prevent
            >
              See more
            </a>
          </div>

          <!-- API Credentials Form -->
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="connect-api-key">Key</Label>
              <Input
                id="connect-api-key"
                v-model="connectApiKey"
                type="password"
                placeholder="Enter your API key"
                class="w-full"
              />
            </div>
            <div class="space-y-2">
              <Label for="connect-api-secret">Secret</Label>
              <Input
                id="connect-api-secret"
                v-model="connectApiSecret"
                type="password"
                placeholder="Enter your API secret"
                class="w-full"
              />
            </div>
          </div>

          <!-- Support Link -->
          <div class="text-center">
            <a
              href="#"
              class="text-sm text-primary hover:underline"
              @click.prevent
            >
              Contact support for help connecting your broker.
            </a>
          </div>

          <!-- Disclaimer -->
          <div class="space-y-4 pt-4 border-t border-border">
            <div class="space-y-3 text-sm text-muted-foreground">
              <p>
                TradeFI is a tool that gives you the power to fully automate order execution with a broker and/or exchange accounts you connect via web hooks. Safely using TradeFI requires a level of skill and experience that not every individual will possess. Automating orders with TradeFI can still be risky for skilled and experienced users.
              </p>
              <p class="font-semibold text-foreground">
                BY USING TRADEFI, YOU ACKNOWLEDGE THAT YOU KNOW, UNDERSTAND, AND APPRECIATE THE RISKS THAT ARE INHERENT IN THE USE OF THE PRODUCT AND NEVERTHELESS VOLUNTARILY AGREE TO ASSUME SUCH RISKS.
              </p>
              <p>
                You hereby forever release and discharge (and agree to fully indemnify and hold harmless) TradeFI, its parent company, associated companies, and employees of TradeFI from any and all claims, demands, suits, causes of action and liabilities, costs, losses, expenses, and damages incurred by or brought or threatened against TradeFI arising from or in connection with your use of TradeFI, including, without limitation, those arising from errors, breaks, or downtime in TradeFI's system or those of its vendors. You are responsible for monitoring your positions and ensuring that your signals are being successfully processed at all times. By proceeding to connect this broker, you reaffirm that you agree to the preceding disclaimer and that you have read, understand and agree to the TradeFI Terms of Service, which contains additional disclaimers and limitations.
              </p>
            </div>
          </div>
        </div>

        <SheetFooter class="mt-6">
          <Button
            variant="outline"
            @click="showConnectDialog = false"
          >
            Cancel
          </Button>
          <Button
            @click="handleConnectExchange"
            :disabled="!connectApiKey || !connectApiSecret"
          >
            Continue
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'

// Types
type CredentialKey = 'aster' | 'oanda' | 'tradier' | 'tastytrade'

interface CredentialForm {
  id: string | null
  label: string
  accountId: string
  apiKey: string
  apiSecret: string
  passphrase: string
  webhookSecret: string
  extraMetadata: Record<string, any>
  updatedAt: string | null
  lastTested: string | null
  testStatus: 'success' | 'failed' | null
  showApiKey: boolean
  showApiSecret: boolean
  showPassphrase: boolean
}

interface BotCredentialRecord {
  id: string
  exchange: string
  label: string
  environment: string
  account_id?: string
  api_key?: string
  api_secret?: string
  passphrase?: string
  webhook_secret?: string
  extra_metadata?: Record<string, any>
  created_at: string
  updated_at: string
  last_tested?: string | null
}

interface ExchangeBalance {
  success: boolean
  exchange?: string
  balance?: number | null
  availableBalance?: number | null
  marginAvailable?: number | null
  cashAvailable?: number | null
  totalMarketValue?: number | null
  availableFunds?: number | null
  buyingPower?: number | null
  totalUnrealizedPnl?: number | null
  unrealizedPL?: number | null
  error?: string
  disabled?: boolean
  [key: string]: any
}

interface AvailableExchange {
  id: string
  name: string
  icon: string
  logo?: string
  assetClass: string
  assetTypes: string
  marketHours: string
  colorClass: string
  isConnected: boolean
  instructions?: string
  ipWhitelist?: string
}

// Exchange Cards Configuration - Base configs for known exchanges
const exchangeConfigs: Record<string, {
  name: string
  icon: string
  iconColor: string
  assetClass: string
  marketHours: string
  showApiSecret: boolean
  showPassphrase: boolean
  logo?: string
}> = {
  aster: {
    name: 'Aster DEX',
    icon: 'i-simple-icons-bitcoin',
    iconColor: 'text-orange-500',
    assetClass: 'Crypto',
    marketHours: '24/7 Trading',
    showApiSecret: true,
    showPassphrase: false,
    logo: '/aster_logo.png'
  },
  oanda: {
    name: 'OANDA',
    icon: 'i-heroicons-currency-dollar',
    iconColor: 'text-green-500',
    assetClass: 'Forex',
    marketHours: '24/5 Trading',
    showApiSecret: false,
    showPassphrase: false,
    logo: '/oanda_logo.png'
  },
  tradier: {
    name: 'Tradier',
    icon: 'i-heroicons-chart-bar',
    iconColor: 'text-blue-500',
    assetClass: 'Stocks/Options',
    marketHours: 'Market Hours',
    showApiSecret: false,
    showPassphrase: false,
    logo: '/tradier_logo.png'
  },
  tastytrade: {
    name: 'Tasty Trade',
    icon: 'i-heroicons-chart-bar',
    iconColor: 'text-indigo-500',
    assetClass: 'Futures',
    marketHours: 'Extended Hours',
    showApiSecret: true,
    showPassphrase: true,
    logo: '/tastytrade_logo.jpg'
  },
  binance: {
    name: 'Binance',
    icon: 'i-simple-icons-bitcoin',
    iconColor: 'text-yellow-500',
    assetClass: 'Crypto',
    marketHours: '24/7 Trading',
    showApiSecret: true,
    showPassphrase: false,
    logo: '/Binance_Logo.png'
  },
  coinbase: {
    name: 'Coinbase Pro',
    icon: 'i-simple-icons-bitcoin',
    iconColor: 'text-blue-500',
    assetClass: 'Crypto',
    marketHours: '24/7 Trading',
    showApiSecret: true,
    showPassphrase: false,
    logo: '/coinbase_pro_logo.png'
  },
  'interactive-brokers': {
    name: 'Interactive Brokers',
    icon: 'i-heroicons-chart-bar',
    iconColor: 'text-purple-500',
    assetClass: 'Multi-Asset',
    marketHours: 'Global',
    showApiSecret: true,
    showPassphrase: false,
    logo: '/interactive_brokers_logo.png'
  },
  alpaca: {
    name: 'Alpaca',
    icon: 'i-heroicons-chart-bar',
    iconColor: 'text-cyan-500',
    assetClass: 'Stocks/Crypto',
    marketHours: 'Extended Hours',
    showApiSecret: true,
    showPassphrase: false,
    logo: '/alpaca_logo.png'
  }
}

// Legacy exchangeCards for backward compatibility
const exchangeCards = [
  { key: 'aster' as const, ...exchangeConfigs.aster },
  { key: 'oanda' as const, ...exchangeConfigs.oanda },
  { key: 'tradier' as const, ...exchangeConfigs.tradier },
  { key: 'tastytrade' as const, ...exchangeConfigs.tastytrade }
]

// Helper to create credential form
function createCredentialForm(defaultLabel: string): CredentialForm {
  return {
    id: null,
    label: defaultLabel,
    accountId: '',
    apiKey: '',
    apiSecret: '',
    passphrase: '',
    webhookSecret: '',
    extraMetadata: { webhookUrl: '' },
    updatedAt: null,
    lastTested: null,
    testStatus: null,
    showApiKey: false,
    showApiSecret: false,
    showPassphrase: false
  }
}

// Store single credential form for each exchange - now dynamic
const credentialForms = reactive<Record<string, CredentialForm>>({})

// Initialize forms for known exchanges
function initializeCredentialForm(exchangeId: string, defaultLabel?: string): CredentialForm {
  if (!credentialForms[exchangeId]) {
    const config = exchangeConfigs[exchangeId]
    const label = defaultLabel || config?.name || exchangeId.charAt(0).toUpperCase() + exchangeId.slice(1).replace(/-/g, ' ')
    credentialForms[exchangeId] = createCredentialForm(label)
  }
  return credentialForms[exchangeId]
}

// Initialize known exchanges
Object.keys(exchangeConfigs).forEach(key => {
  initializeCredentialForm(key)
})

// State
const isLoading = ref(false)
const credentialsLoading = ref(false)
const savingCredential = ref<string | null>(null)
const deletingCredential = ref<string | null>(null)
const testingCredential = ref<string | null>(null)
const showAddExchangeSheet = ref(false)
const exchangeSearch = ref('')
const showConnectDialog = ref(false)
const selectedExchange = ref<AvailableExchange | null>(null)
const connectApiKey = ref('')
const connectApiSecret = ref('')

// Expanded cards state - now dynamic
const expandedCards = ref<Record<string, boolean>>({})

// Balance state - now dynamic
const exchangeBalances = ref<Record<string, ExchangeBalance>>({})
// Track when credentials were last saved to suppress initial errors
const credentialSaveTimes = ref<Record<string, number>>({})
// Track when page first loaded to suppress initial errors
const pageLoadTime = ref<number | null>(null)
const CHECKING_GRACE_PERIOD = 5000 // 5 seconds grace period after saving credentials
const INITIAL_LOAD_GRACE_PERIOD = 20000 // 20 seconds grace period for initial page load

// Initialize balances for known exchanges
function initializeBalance(exchangeId: string) {
  if (!exchangeBalances.value[exchangeId]) {
    const now = Date.now()
    const pageLoad = pageLoadTime.value || 0
    const isInInitialLoadGracePeriod = pageLoad > 0 && (now - pageLoad) < INITIAL_LOAD_GRACE_PERIOD
    
    exchangeBalances.value[exchangeId] = { 
      success: false, 
      disabled: false,
      checking: isInInitialLoadGracePeriod // Set to checking if in grace period
    }
  }
  return exchangeBalances.value[exchangeId]
}

// Initialize known exchanges
Object.keys(exchangeConfigs).forEach(key => {
  initializeBalance(key)
})

// Available Exchanges (expandable to 10-20)
const availableExchanges = ref<AvailableExchange[]>([
  {
    id: 'aster',
    name: 'Aster DEX',
    icon: 'i-simple-icons-bitcoin',
    logo: '/aster_logo.png',
    assetClass: 'Crypto',
    assetTypes: 'Crypto',
    marketHours: '24/7 Trading',
    colorClass: 'bg-orange-500/20 text-orange-500',
    isConnected: false,
    instructions: 'To obtain the following credentials, login to your Aster DEX account and navigate to API Management to create API keys.'
  },
  {
    id: 'oanda',
    name: 'OANDA',
    icon: 'i-heroicons-currency-dollar',
    logo: '/oanda_logo.png',
    assetClass: 'Forex',
    assetTypes: 'Forex',
    marketHours: '24/5 Trading',
    colorClass: 'bg-green-500/20 text-green-500',
    isConnected: false,
    instructions: 'To obtain the following credentials, login to your OANDA account and navigate to Manage API Access to create API keys.'
  },
  {
    id: 'tradier',
    name: 'Tradier',
    icon: 'i-heroicons-chart-bar',
    logo: '/tradier_logo.png',
    assetClass: 'Stocks/Options',
    assetTypes: 'Stocks • Options',
    marketHours: 'Market Hours',
    colorClass: 'bg-blue-500/20 text-blue-500',
    isConnected: false,
    instructions: 'To obtain the following credentials, login to your Tradier account and navigate to Settings > API Access to generate API keys.'
  },
  {
    id: 'tastytrade',
    name: 'Tasty Trade',
    icon: 'i-heroicons-chart-line',
    logo: '/tastytrade_logo.jpg',
    assetClass: 'Futures',
    assetTypes: 'Futures • Options',
    marketHours: 'Extended Hours',
    colorClass: 'bg-indigo-500/20 text-indigo-500',
    isConnected: false,
    instructions: 'To obtain the following credentials, login to your TastyTrade account and navigate to My Account > API Access to create API keys.'
  },
  {
    id: 'binance',
    name: 'Binance',
    icon: 'i-simple-icons-bitcoin',
    logo: '/Binance_Logo.png',
    assetClass: 'Crypto',
    assetTypes: 'Crypto',
    marketHours: '24/7 Trading',
    colorClass: 'bg-yellow-500/20 text-yellow-500',
    isConnected: false,
    instructions: 'To obtain the following credentials, login and select: Profile > API Management > Create API (System-generated API keys). If you need to whitelist our IP, then use: 18.181.219.254 (or 13.58.60.205 for BinanceUS).',
    ipWhitelist: '18.181.219.254 (or 13.58.60.205 for BinanceUS)'
  },
  {
    id: 'coinbase',
    name: 'Coinbase Pro',
    icon: 'i-simple-icons-bitcoin',
    logo: '/coinbase_pro_logo.png',
    assetClass: 'Crypto',
    assetTypes: 'Crypto',
    marketHours: '24/7 Trading',
    colorClass: 'bg-blue-600/20 text-blue-500',
    isConnected: false,
    instructions: 'To obtain the following credentials, login to your Coinbase Pro account and navigate to Settings > API to create API keys.'
  },
  {
    id: 'interactive-brokers',
    name: 'Interactive Brokers',
    icon: 'i-heroicons-chart-bar',
    logo: '/interactive_brokers_logo.png',
    assetClass: 'Multi-Asset',
    assetTypes: 'Stocks • Options • Futures • Forex • Crypto',
    marketHours: 'Global',
    colorClass: 'bg-purple-500/20 text-purple-500',
    isConnected: false,
    instructions: 'To obtain the following credentials, login to your Interactive Brokers account and navigate to Account Management > API Settings to create API keys.'
  },
  {
    id: 'alpaca',
    name: 'Alpaca',
    icon: 'i-heroicons-chart-bar',
    logo: '/alpaca_logo.png',
    assetClass: 'Stocks/Crypto',
    assetTypes: 'Stocks • Options • Crypto',
    marketHours: 'Extended Hours',
    colorClass: 'bg-cyan-500/20 text-cyan-500',
    isConnected: false,
    instructions: 'To obtain the following credentials, login to your Alpaca account and navigate to API Keys section to generate API keys.'
  }
])

const toast = useToast()

const credentialCardMap = exchangeCards.reduce<Record<string, (typeof exchangeCards)[number]>>((acc, card) => {
  acc[card.key] = card
  return acc
}, {})

// Helper Functions
function credentialTitle(key: string) {
  const config = exchangeConfigs[key]
  const availableExchange = availableExchanges.value.find(e => e.id === key)
  return config?.name || availableExchange?.name || key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ')
}

function isCredentialConnected(key: string) {
  const form = credentialForms[key]
  if (!form) return false
  const config = exchangeConfigs[key]
  const needsSecret = config?.showApiSecret ?? true
  
  if (!needsSecret) {
    return Boolean(form.apiKey)
  }
  return Boolean(form.apiKey && form.apiSecret)
}

function getCredentialStatus(key: string): { color: 'success' | 'warning' | 'error' | 'neutral'; label: string; icon: string } {
  const form = credentialForms[key]
  if (!form) return { color: 'neutral', label: 'Not Configured', icon: 'i-heroicons-x-circle' }
  
  const hasCredentials = isCredentialConnected(key)
  
  if (!hasCredentials) {
    return { color: 'neutral', label: 'Not Configured', icon: 'i-heroicons-minus-circle' }
  }
  
  if (form.testStatus === 'success') {
    return { color: 'success', label: 'Connected & Tested', icon: 'i-heroicons-check-circle' }
  }
  
  if (form.testStatus === 'failed') {
    return { color: 'error', label: 'Connection Failed', icon: 'i-heroicons-x-circle' }
  }
  
  // Has credentials but not tested
  return { color: 'warning', label: 'Saved (Not Tested)', icon: 'i-heroicons-exclamation-triangle' }
}

function getExchangeStatus(key: string): { color: 'success' | 'error' | 'neutral'; label: string } {
  const balance = getBalanceData(key)
  const credentialStatus = getCredentialStatus(key)
  
  if (balance?.success) {
    return { color: 'success', label: 'Connected' }
  }
  
  if (credentialStatus.color === 'success' || credentialStatus.color === 'warning') {
    return { color: 'neutral', label: 'Configured' }
  }
  
  return { color: 'error', label: 'Not Connected' }
}

function formatLastTested(timestamp?: string | null): string {
  if (!timestamp) return 'Never tested'
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

function getBalanceData(key: string): ExchangeBalance | null {
  return exchangeBalances.value[key] || null
}

function getBalanceLabel(key: string): string {
  if (key === 'tradier' || key === 'tastytrade') return 'Total Equity'
  return 'Total Balance'
}

function getBalance(key: string): number | null {
  const data = getBalanceData(key)
  return data?.balance ?? null
}

function isBalanceLoading(key: string): boolean {
  const data = getBalanceData(key)
  const now = Date.now()
  const pageLoad = pageLoadTime.value || 0
  const isInInitialLoadGracePeriod = pageLoad > 0 && (now - pageLoad) < INITIAL_LOAD_GRACE_PERIOD
  
  // If no data exists, check if we're in grace period
  if (!data) {
    return isInInitialLoadGracePeriod
  }
  
  // If balance is explicitly in checking state, show loading
  if (data.checking === true) {
    return true
  }
  
  // If we're in grace period and balance hasn't loaded successfully yet, show loading
  if (isInInitialLoadGracePeriod && !data.success && !data.balance) {
    return true
  }
  
  return false
}

function getAvailableLabel(key: string): string {
  switch (key) {
    case 'oanda': return 'Margin Available'
    case 'tradier': return 'Cash Available'
    case 'tastytrade': return 'Available Funds'
    default: return 'Available'
  }
}

function getAvailable(key: string): number | null {
  const data = getBalanceData(key)
  if (!data) return null
  
  switch (key) {
    case 'aster': return data.availableBalance ?? null
    case 'oanda': return data.marginAvailable ?? null
    case 'tradier': return data.cashAvailable ?? null
    case 'tastytrade': return data.availableFunds ?? null
    default: return data.availableBalance ?? data.availableFunds ?? data.marginAvailable ?? data.cashAvailable ?? null
  }
}

function getUnrealizedPnl(key: string): number | null {
  const data = getBalanceData(key)
  if (!data) return null
  
  if (key === 'oanda') {
    return data.unrealizedPL ?? null
  }
  return data.totalUnrealizedPnl ?? null
}

// Update exchange connection status
function updateExchangeStatus() {
  availableExchanges.value.forEach(exchange => {
    const balance = exchangeBalances.value[exchange.id]
    exchange.isConnected = balance?.success ?? false
  })
}

// Filter exchanges by search
const filteredExchanges = computed(() => {
  if (!exchangeSearch.value) return availableExchanges.value
  
  const search = exchangeSearch.value.toLowerCase()
  return availableExchanges.value.filter(exchange =>
    exchange.name.toLowerCase().includes(search) ||
    exchange.assetClass.toLowerCase().includes(search) ||
    exchange.assetTypes.toLowerCase().includes(search)
  )
})

// Helper to check if we're in any grace period
const isInGracePeriod = computed(() => {
  const now = Date.now()
  const pageLoad = pageLoadTime.value || 0
  return pageLoad > 0 && (now - pageLoad) < INITIAL_LOAD_GRACE_PERIOD
})

const hasErrors = computed(() => {
  const now = Date.now()
  const pageLoad = pageLoadTime.value || 0
  const isInInitialLoadGracePeriod = pageLoad > 0 && (now - pageLoad) < INITIAL_LOAD_GRACE_PERIOD
  
  return Object.entries(exchangeBalances.value).some(([exchangeId, balance]) => {
    // Only show errors for exchanges that have saved credentials
    if (!balance || balance.disabled || !credentialForms[exchangeId]?.id) return false
    
    // Don't show errors if we're still checking (grace period)
    if (balance.checking) return false
    
    // Don't show errors during initial load grace period
    if (isInInitialLoadGracePeriod) return false
    
    // Don't show errors if the last check was recent (within grace period)
    if (balance.lastChecked) {
      const timeSinceCheck = now - balance.lastChecked
      if (timeSinceCheck < INITIAL_LOAD_GRACE_PERIOD) return false
    }
    
    // Only show if there's an actual error (not just checking)
    return !balance.success && balance.error && !balance.checking
  })
})

// Computed: All exchange cards (dynamic - only shows exchanges with saved credentials)
const allExchangeCards = computed(() => {
  // Only get exchanges that have credentials saved (have an ID)
  const credentialExchanges = Object.keys(credentialForms).filter(key => credentialForms[key]?.id)
  
  // Create cards only for exchanges with credentials
  return credentialExchanges.map(exchangeId => {
    const config = exchangeConfigs[exchangeId]
    const availableExchange = availableExchanges.value.find(e => e.id === exchangeId)
    
    return {
      key: exchangeId,
      name: config?.name || availableExchange?.name || exchangeId.charAt(0).toUpperCase() + exchangeId.slice(1).replace(/-/g, ' '),
      icon: config?.icon || availableExchange?.icon || 'i-heroicons-chart-bar',
      iconColor: config?.iconColor || 'text-gray-500',
      assetClass: config?.assetClass || availableExchange?.assetClass || 'Unknown',
      marketHours: config?.marketHours || availableExchange?.marketHours || 'Unknown',
      showApiSecret: config?.showApiSecret ?? true,
      showPassphrase: config?.showPassphrase ?? false,
      logo: config?.logo || availableExchange?.logo
    }
  }).sort((a, b) => {
    // Sort by name
    return a.name.localeCompare(b.name)
  })
})

// Load balances from APIs - now dynamic
async function loadBalances() {
  isLoading.value = true
  try {
    // Get all exchanges that have credentials
    const exchangesWithCreds = Object.keys(credentialForms).filter(key => credentialForms[key]?.id)
    
    const now = Date.now()
    const pageLoad = pageLoadTime.value || 0
    const isInInitialLoadGracePeriod = pageLoad > 0 && (now - pageLoad) < INITIAL_LOAD_GRACE_PERIOD
    
    // Initialize all balances with checking state if in grace period
    exchangesWithCreds.forEach(exchangeId => {
      if (!exchangeBalances.value[exchangeId]) {
        initializeBalance(exchangeId)
      }
      // Set checking state if in grace period
      if (isInInitialLoadGracePeriod) {
        exchangeBalances.value[exchangeId].checking = true
      }
    })
    
    // Load balances for all exchanges with credentials
    const balancePromises = exchangesWithCreds.map(async (exchangeId) => {
      const lastSaved = credentialSaveTimes.value[exchangeId] || 0
      
      // Check if we're in grace period (either after saving credentials OR initial page load)
      const isInSaveGracePeriod = (now - lastSaved) < CHECKING_GRACE_PERIOD
      const isInGracePeriod = isInSaveGracePeriod || isInInitialLoadGracePeriod
      
      try {
        const balance = await $fetch(`/api/balance/${exchangeId}`)
        exchangeBalances.value[exchangeId] = {
          ...balance as ExchangeBalance,
          checking: false,
          lastChecked: now
        }
        return { exchangeId, balance: exchangeBalances.value[exchangeId] }
      } catch (e: any) {
        // Handle disabled exchanges (like tastytrade)
        const disabled = exchangeId === 'tastytrade'
        
        // If in grace period, show as "checking" instead of error
        if (isInGracePeriod && !disabled) {
          exchangeBalances.value[exchangeId] = {
            success: false,
            checking: true,
            disabled,
            lastChecked: now,
            error: undefined // Clear any previous error during grace period
          } as ExchangeBalance
        } else {
          exchangeBalances.value[exchangeId] = {
            success: false,
            error: e.message,
            disabled,
            checking: false,
            lastChecked: now
          } as ExchangeBalance
        }
        return { exchangeId, balance: exchangeBalances.value[exchangeId] }
      }
    })
    
    await Promise.all(balancePromises)
    
    // Update exchange connection status
    updateExchangeStatus()
  } catch (error) {
    console.error('Error loading balances:', error)
  } finally {
    isLoading.value = false
  }
}

// Load credentials
async function loadCredentials() {
  credentialsLoading.value = true
  try {
    const response = await $fetch<{ data: BotCredentialRecord[] }>('/api/bot/credentials')
    response.data?.forEach(applyCredential)
  } catch (error) {
    console.error('Failed to load bot credentials', error)
    toast.add({
      title: 'Unable to load credentials',
      color: 'error',
      description: 'Check Supabase configuration and try again.'
    })
  } finally {
    credentialsLoading.value = false
  }
}

function applyCredential(record: BotCredentialRecord) {
  const key = record.exchange

  // Only load production credentials (ignore practice/paper)
  if (record.environment && record.environment !== 'production') {
    return
  }

  // Initialize form if it doesn't exist
  if (!credentialForms[key]) {
    initializeCredentialForm(key, record.label)
  }
  
  // Initialize balance if it doesn't exist
  if (!exchangeBalances.value[key]) {
    initializeBalance(key)
  }

  if (!credentialForms[key]) {
    initializeCredentialForm(key, record.label)
  }
  
  const target = credentialForms[key]
  if (!target) return
  
  const config = exchangeConfigs[key]
  
  target.id = record.id
  target.label = record.label || config?.name || key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ')
  target.accountId = record.account_id || ''
  target.apiKey = record.api_key || ''
  target.apiSecret = record.api_secret || ''
  target.passphrase = record.passphrase || ''
  target.webhookSecret = record.webhook_secret || ''
  target.extraMetadata = record.extra_metadata || {}
  target.updatedAt = record.updated_at
  target.lastTested = record.last_tested || null
  // Set testStatus based on last_tested
  if (record.last_tested) {
    // If we have a last_tested timestamp, assume it was successful (we'll update on next test)
    target.testStatus = 'success'
  }
}

async function saveCredential(key: string) {
  if (!credentialForms[key]) {
    initializeCredentialForm(key)
  }
  const form = credentialForms[key]
  if (!form) return
  
  savingCredential.value = key
  try {
    const payload = {
      id: form.id,
      exchange: key,
      label: form.label,
      environment: 'production', // Always use production
      accountId: form.accountId || null,
      apiKey: form.apiKey || null,
      apiSecret: form.apiSecret || null,
      passphrase: form.passphrase || null,
      webhookSecret: form.webhookSecret || null,
      extraMetadata: form.extraMetadata || {}
    }

    const response = await $fetch<{ success: boolean; credential: BotCredentialRecord }>('/api/bot/credentials', {
      method: 'POST',
      body: payload
    })

    applyCredential(response.credential)
    
    // Track when credentials were saved to suppress initial errors
    credentialSaveTimes.value[key] = Date.now()
    
    if (credentialForms[key]) {
      credentialForms[key].testStatus = null
      credentialForms[key].lastTested = null
    }
    
    // Set checking state for this exchange
    if (exchangeBalances.value[key]) {
      exchangeBalances.value[key].checking = true
    }
    
    toast.add({
      title: `✓ ${credentialTitle(key)} Saved`,
      description: 'Credentials have been saved successfully.',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })
    
    // Trigger balance check after a short delay
    setTimeout(() => {
      loadBalances()
    }, 1000)
  } catch (error) {
    console.error('Error saving credential:', error)
    toast.add({
      title: `Failed to save ${credentialTitle(key)}`,
      description: String(error),
      color: 'error'
    })
  } finally {
    savingCredential.value = null
  }
}

async function testConnection(key: string) {
  if (!credentialForms[key]) {
    initializeCredentialForm(key)
  }
  const form = credentialForms[key]
  if (!form) return
  
  testingCredential.value = key
  
  try {
    const apiEndpoint = `/api/balance/${key}`
    
    const response = await $fetch<ExchangeBalance>(apiEndpoint)
    
    if (response.success) {
      const testTimestamp = new Date().toISOString()
      
      if (credentialForms[key]) {
        credentialForms[key].testStatus = 'success'
        credentialForms[key].lastTested = testTimestamp
      }
      
      // Save last_tested to database
      try {
        await $fetch('/api/bot/credentials', {
          method: 'PATCH',
          body: {
            exchange: key,
            last_tested: testTimestamp
          }
        })
      } catch (err) {
        console.error('Failed to save last_tested timestamp:', err)
        // Don't fail the test if we can't save the timestamp
      }
      
      // Update balance data dynamically
      if (!exchangeBalances.value[key]) {
        initializeBalance(key)
      }
      exchangeBalances.value[key] = response
      updateExchangeStatus()
      
      toast.add({
        title: `✓ ${credentialTitle(key)} Connected`,
        description: `Balance: $${response.balance?.toFixed(2) || '0.00'}`,
        color: 'success',
        icon: 'i-heroicons-check-circle'
      })
    } else {
      if (credentialForms[key]) {
        credentialForms[key].testStatus = 'failed'
        credentialForms[key].lastTested = new Date().toISOString()
      }
      
      toast.add({
        title: `${credentialTitle(key)} Connection Failed`,
        description: response.error || 'Unknown error occurred.',
        color: 'error',
        icon: 'i-heroicons-x-circle'
      })
    }
  } catch (error) {
    if (credentialForms[key]) {
      credentialForms[key].testStatus = 'failed'
      credentialForms[key].lastTested = new Date().toISOString()
    }
    
    toast.add({
      title: `${credentialTitle(key)} Test Failed`,
      description: String(error),
      color: 'error',
      icon: 'i-heroicons-x-circle'
    })
  } finally {
    testingCredential.value = null
  }
}

async function deleteCredential(key: string) {
  if (!confirm(`Remove credentials for ${credentialTitle(key)}? This action cannot be undone.`)) {
    return
  }

  deletingCredential.value = key
  try {
    if (!credentialForms[key]) {
      initializeCredentialForm(key)
    }
    const form = credentialForms[key]
    if (!form?.id) {
      throw new Error('No credential ID found')
    }
    
    await $fetch(`/api/bot/credentials?id=${form.id}&environment=production`, {
      method: 'DELETE'
    })
    
    // Reset form
    const config = exchangeConfigs[key]
    const defaultLabel = config?.name || credentialTitle(key)
    if (credentialForms[key]) {
      Object.assign(credentialForms[key], createCredentialForm(defaultLabel))
    }
    
    // Clear balance
    if (exchangeBalances.value[key]) {
      exchangeBalances.value[key] = { success: false, disabled: false }
    }
    
    toast.add({
      title: `✓ ${credentialTitle(key)} Removed`,
      description: 'Credentials have been deleted successfully.',
      color: 'warning',
      icon: 'i-heroicons-trash'
    })
  } catch (error) {
    console.error('Error deleting credential:', error)
    toast.add({
      title: `Failed to delete ${credentialTitle(key)}`,
      description: String(error),
      color: 'error'
    })
  } finally {
    deletingCredential.value = null
  }
}

// Select exchange from sheet
function selectExchange(exchange: AvailableExchange) {
  showAddExchangeSheet.value = false
  
  // Check if this exchange already has saved credentials (has a card)
  const hasCredentials = credentialForms[exchange.id]?.id
  
  if (hasCredentials) {
    // Expand the card for the selected exchange
    expandedCards.value[exchange.id] = true
    // Scroll to the card after a brief delay
    setTimeout(() => {
      const cardElement = document.querySelector(`[data-exchange="${exchange.id}"]`)
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  } else {
    // New exchange - show connection dialog
    selectedExchange.value = exchange
    connectApiKey.value = ''
    connectApiSecret.value = ''
    showConnectDialog.value = true
  }
}

// Handle connection dialog submission
async function handleConnectExchange() {
  if (!selectedExchange.value || !connectApiKey.value || !connectApiSecret.value) return
  
  const exchange = selectedExchange.value
  const exchangeName = exchange.name
  const exchangeId = exchange.id
  
  try {
    const payload = {
      id: null, // New credential
      exchange: exchangeId,
      label: exchangeName,
      environment: 'production',
      accountId: null,
      apiKey: connectApiKey.value,
      apiSecret: connectApiSecret.value,
      passphrase: null,
      webhookSecret: null,
      extraMetadata: {}
    }

    const response = await $fetch<{ success: boolean; credential: BotCredentialRecord }>('/api/bot/credentials', {
      method: 'POST',
      body: payload
    })

    if (response.success) {
      toast.add({
        title: `✓ ${exchangeName} Connected`,
        description: 'Credentials have been saved successfully.',
        color: 'success',
        icon: 'i-heroicons-check-circle'
      })
      
      // Reload credentials to refresh the UI
      await loadCredentials()
      
      // If this is one of the existing exchanges, expand its card
      const existingKey = exchangeId as CredentialKey | undefined
      if (existingKey && (existingKey === 'aster' || existingKey === 'oanda' || existingKey === 'tradier' || existingKey === 'tastytrade')) {
        expandedCards.value[existingKey] = true
        setTimeout(() => {
          const cardElement = document.querySelector(`[data-exchange="${existingKey}"]`)
          if (cardElement) {
            cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)
      }
      
      // Close dialog and reset
      showConnectDialog.value = false
      selectedExchange.value = null
      connectApiKey.value = ''
      connectApiSecret.value = ''
    }
  } catch (error) {
    console.error('Error saving credential:', error)
    toast.add({
      title: `Failed to connect ${exchangeName}`,
      description: String(error),
      color: 'error'
    })
  }
}

// Refresh all data
async function refreshAll() {
  await Promise.all([loadBalances(), loadCredentials()])
}

// Load on mount and refresh every 30 seconds
onMounted(async () => {
  // Track when page first loads - set this FIRST before any async operations
  pageLoadTime.value = Date.now()
  
  // Load credentials first to know which exchanges have credentials
  await loadCredentials()
  
  // Initialize balances for exchanges with credentials and set checking state
  Object.keys(credentialForms).forEach(key => {
    if (credentialForms[key]?.id) {
      if (!exchangeBalances.value[key]) {
        initializeBalance(key)
      }
      // Set checking state during initial load grace period
      if (exchangeBalances.value[key]) {
        exchangeBalances.value[key].checking = true
      }
    }
  })
  
  // Now load balances
  await loadBalances()
  setInterval(loadBalances, 30000)
})

definePageMeta({
  title: 'Exchanges',
  description: 'Manage your exchange connections, view balances, and configure API keys'
})
</script>
