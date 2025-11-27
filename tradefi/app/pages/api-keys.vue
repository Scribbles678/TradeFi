<template>
  <div class="space-y-8 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-semibold text-foreground">API Keys</h1>
        <p class="text-muted-foreground text-sm mt-1">Connect your exchange accounts securely</p>
      </div>
      <Button
        size="sm"
        :disabled="credentialsLoading"
        @click="loadCredentials"
      >
        <Icon name="i-heroicons-arrow-path" class="w-4 h-4 mr-1" />
        Refresh
      </Button>
    </div>

    <!-- Security Notice -->
    <Card class="border-blue-500/20 bg-blue-500/5">
      <CardContent class="flex gap-3 py-4">
        <Icon name="i-heroicons-shield-check" class="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div class="text-sm">
          <p class="font-semibold mb-1 text-foreground">Security Notice</p>
          <p class="text-muted-foreground">
            API credentials are stored in Supabase, encrypted at rest, and never exposed to the browser. Updates from this page flow directly to Sparky.
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- API Keys Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card
        v-for="card in credentialCards"
        :key="card.key"
        class="compact-card"
      >
        <CardHeader>
          <div class="flex items-start justify-between py-1 gap-3">
            <div class="flex items-start gap-2 flex-1 min-w-0">
              <Icon :name="card.icon" class="w-5 h-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <CardTitle class="text-base">{{ card.name }}</CardTitle>
                  <div class="flex items-center gap-1.5">
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
                    <Badge 
                      :variant="getCredentialStatus(card.key).color === 'success' ? 'success' : getCredentialStatus(card.key).color === 'error' ? 'error' : 'outline'" 
                      class="text-xs"
                    >
                      {{ getCredentialStatus(card.key).label }}
                    </Badge>
                  </div>
                </div>
                <p class="text-xs text-muted-foreground mt-0.5">
                  Last tested: {{ formatLastTested(credentialForms[card.key].lastTested) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <!-- Environment Buttons (Live/Paper) - Only show for non-aster exchanges -->
              <div v-if="card.key !== 'aster'" class="flex items-center gap-2">
                <button
                  @click="switchEnvironment(card.key, false)"
                  :class="[
                    'px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200',
                    !credentialForms[card.key].isLive 
                      ? 'bg-card text-green-400 border-2 border-green-400' 
                      : 'bg-card text-muted-foreground border border-border hover:border-foreground/20'
                  ]"
                >
                  📄 Paper
                </button>
                <button
                  @click="switchEnvironment(card.key, true)"
                  :class="[
                    'px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200',
                    credentialForms[card.key].isLive 
                      ? 'bg-card text-green-400 border-2 border-green-400' 
                      : 'bg-card text-muted-foreground border border-border hover:border-foreground/20'
                  ]"
                >
                  🔴 Live
                </button>
              </div>
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
        </CardHeader>
        <CardContent>

        <div class="space-y-2">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <UFormField label="Label">
              <UInput
                v-model="credentialForms[card.key].label"
                placeholder="Account label"
                size="sm"
              />
            </UFormField>

            <UFormField :label="card.key === 'oanda' ? 'API Token' : 'API Key'">
              <div class="relative">
                <UInput
                  v-model="credentialForms[card.key].apiKey"
                  :type="credentialForms[card.key].showApiKey ? 'text' : 'password'"
                  placeholder="API key or token"
                  size="sm"
                  class="pr-10"
                />
                <button
                  type="button"
                  @click="credentialForms[card.key].showApiKey = !credentialForms[card.key].showApiKey"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <Icon 
                    :name="credentialForms[card.key].showApiKey ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" 
                    class="w-4 h-4"
                  />
                </button>
              </div>
            </UFormField>

            <UFormField label="Account ID" v-if="card.key !== 'tastytrade'">
              <UInput
                v-model="credentialForms[card.key].accountId"
                placeholder="Account ID / Number"
                size="sm"
              />
            </UFormField>

            <UFormField label="API Secret" v-if="card.showApiSecret !== false">
              <div class="relative">
                <UInput
                  v-model="credentialForms[card.key].apiSecret"
                  :type="credentialForms[card.key].showApiSecret ? 'text' : 'password'"
                  placeholder="API secret (if required)"
                  size="sm"
                  class="pr-10"
                />
                <button
                  type="button"
                  @click="credentialForms[card.key].showApiSecret = !credentialForms[card.key].showApiSecret"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <Icon 
                    :name="credentialForms[card.key].showApiSecret ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" 
                    class="w-4 h-4"
                  />
                </button>
              </div>
            </UFormField>

            <UFormField
              label="Passphrase"
              v-if="card.showPassphrase"
            >
              <div class="relative">
                <UInput
                  v-model="credentialForms[card.key].passphrase"
                  :type="credentialForms[card.key].showPassphrase ? 'text' : 'password'"
                  placeholder="Optional passphrase"
                  size="sm"
                  class="pr-10"
                />
                <button
                  type="button"
                  @click="credentialForms[card.key].showPassphrase = !credentialForms[card.key].showPassphrase"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <Icon 
                    :name="credentialForms[card.key].showPassphrase ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" 
                    class="w-4 h-4"
                  />
                </button>
              </div>
            </UFormField>
          </div>

        </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'

// Types
type CredentialKey = 'aster' | 'oanda' | 'tradier' | 'tastytrade' | 'webhook'

interface CredentialForm {
  id: string | null
  label: string
  environment: string
  isLive: boolean
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
}

interface ExchangeBalance {
  success: boolean
  balance?: number
  error?: string
}

// Credential Cards
const credentialCards = [
  {
    key: 'aster' as const,
    name: 'Aster DEX',
    icon: 'i-simple-icons-bitcoin',
    showApiSecret: true,
    showPassphrase: false
  },
  {
    key: 'oanda' as const,
    name: 'OANDA',
    icon: 'i-heroicons-currency-dollar',
    showApiSecret: false
  },
  {
    key: 'tradier' as const,
    name: 'Tradier',
    icon: 'i-heroicons-chart-bar',
    showApiSecret: false
  },
  {
    key: 'tastytrade' as const,
    name: 'Tasty Trade',
    icon: 'i-heroicons-chart-line',
    showApiSecret: true,
    showPassphrase: true
  }
]

// Helper to create credential form
function createCredentialForm(defaultLabel: string, environment: string = 'production'): CredentialForm {
  return {
    id: null,
    label: defaultLabel,
    environment,
    isLive: environment === 'production',
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

// Store BOTH Live and Paper credentials for each exchange
const credentialStore = reactive<Record<CredentialKey, { production: CredentialForm; practice: CredentialForm }>>({
  aster: {
    production: createCredentialForm('Aster DEX', 'production'),
    practice: createCredentialForm('Aster DEX', 'practice')
  },
  oanda: {
    production: createCredentialForm('OANDA', 'production'),
    practice: createCredentialForm('OANDA', 'practice')
  },
  tradier: {
    production: createCredentialForm('Tradier', 'production'),
    practice: createCredentialForm('Tradier', 'practice')
  },
  tastytrade: {
    production: createCredentialForm('Tasty Trade', 'production'),
    practice: createCredentialForm('Tasty Trade', 'practice')
  },
  webhook: {
    production: createCredentialForm('TradingView Webhook', 'production'),
    practice: createCredentialForm('TradingView Webhook', 'practice')
  }
})

// Expose the active form based on current environment toggle
const credentialForms = computed(() => {
  const forms: Record<CredentialKey, CredentialForm> = {} as any
  for (const key in credentialStore) {
    const exchangeKey = key as CredentialKey
    const env = credentialStore[exchangeKey].production.isLive ? 'production' : 'practice'
    forms[exchangeKey] = credentialStore[exchangeKey][env]
  }
  return forms
})

const credentialsLoading = ref(false)
const savingCredential = ref<string | null>(null)
const deletingCredential = ref<string | null>(null)
const testingCredential = ref<string | null>(null)

const toast = useToast()

const credentialCardMap = credentialCards.reduce<Record<string, (typeof credentialCards)[number]>>((acc, card) => {
  acc[card.key] = card
  return acc
}, {})

function credentialTitle(key: CredentialKey) {
  return credentialCardMap[key]?.name || 'TradingView Webhook'
}

function isCredentialConnected(key: CredentialKey) {
  const form = credentialForms.value[key]
  if (!form) return false
  if (key === 'webhook') {
    return Boolean(form.webhookSecret)
  }
  if (key === 'oanda' || key === 'tradier') {
    return Boolean(form.apiKey)
  }
  if (key === 'tastytrade') {
    return Boolean(form.apiKey || form.apiSecret)
  }
  return Boolean(form.apiKey && form.apiSecret)
}

function getCredentialStatus(key: CredentialKey): { color: 'success' | 'warning' | 'error' | 'neutral'; label: string; icon: string } {
  const form = credentialForms.value[key]
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
  const key = record.exchange as CredentialKey
  if (!credentialStore[key]) {
    return
  }

  const environment = (record.environment || 'production') as 'production' | 'practice'
  const target = credentialStore[key][environment]
  
  target.id = record.id
  target.label = record.label || credentialTitle(key)
  target.environment = environment
  target.isLive = environment === 'production'
  target.accountId = record.account_id || ''
  target.apiKey = record.api_key || ''
  target.apiSecret = record.api_secret || ''
  target.passphrase = record.passphrase || ''
  target.webhookSecret = record.webhook_secret || ''
  target.extraMetadata = record.extra_metadata || {}
  target.updatedAt = record.updated_at
}

function switchEnvironment(key: CredentialKey, isLive: boolean) {
  credentialStore[key].production.isLive = isLive
  credentialStore[key].practice.isLive = isLive
  credentialStore[key].production.environment = isLive ? 'production' : 'practice'
  credentialStore[key].practice.environment = isLive ? 'production' : 'practice'
}

async function saveCredential(key: CredentialKey) {
  const form = credentialForms.value[key]
  const currentEnv = form.isLive ? 'production' : 'practice'
  savingCredential.value = key
  try {
    const payload = {
      id: form.id,
      exchange: key,
      label: form.label,
      environment: currentEnv,
      accountId: form.accountId || null,
      apiKey: form.apiKey || null,
      apiSecret: form.apiSecret || null,
      passphrase: form.passphrase || null,
      webhookSecret: key === 'webhook' ? (form.webhookSecret || null) : null,
      extraMetadata: form.extraMetadata || {}
    }

    const response = await $fetch<{ success: boolean; credential: BotCredentialRecord }>('/api/bot/credentials', {
      method: 'POST',
      body: payload
    })

    applyCredential(response.credential)
    
    form.testStatus = null
    form.lastTested = null
    
    const envLabel = currentEnv === 'production' ? 'Live' : 'Paper'
    toast.add({
      title: `✓ ${credentialTitle(key)} (${envLabel}) Saved`,
      description: 'Credentials have been saved successfully.',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })
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

async function testConnection(key: CredentialKey) {
  const form = credentialForms.value[key]
  testingCredential.value = key
  
  try {
    let apiEndpoint = ''
    switch (key) {
      case 'aster':
        apiEndpoint = '/api/balance/aster'
        break
      case 'oanda':
        apiEndpoint = '/api/balance/oanda'
        break
      case 'tradier':
        apiEndpoint = '/api/balance/tradier'
        break
      case 'tastytrade':
        apiEndpoint = '/api/balance/tastytrade'
        break
      default:
        throw new Error('Invalid exchange')
    }
    
    const response = await $fetch<ExchangeBalance>(apiEndpoint)
    
    if (response.success) {
      form.testStatus = 'success'
      form.lastTested = new Date().toISOString()
      
      toast.add({
        title: `✓ ${credentialTitle(key)} Connected`,
        description: `Balance: $${response.balance?.toFixed(2) || '0.00'}`,
        color: 'success',
        icon: 'i-heroicons-check-circle'
      })
    } else {
      form.testStatus = 'failed'
      form.lastTested = new Date().toISOString()
      
      toast.add({
        title: `${credentialTitle(key)} Connection Failed`,
        description: response.error || 'Unknown error occurred.',
        color: 'error',
        icon: 'i-heroicons-x-circle'
      })
    }
  } catch (error) {
    form.testStatus = 'failed'
    form.lastTested = new Date().toISOString()
    
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

async function deleteCredential(key: CredentialKey) {
  const form = credentialForms.value[key]
  const currentEnv = form.isLive ? 'production' : 'practice'
  const envLabel = currentEnv === 'production' ? 'Live' : 'Paper'
  
  if (key === 'webhook') {
    if (!confirm('Clear the stored webhook secret? Existing alerts will stop working.')) {
      return
    }
  } else if (!confirm(`Remove ${envLabel} credentials for ${credentialTitle(key)}? This action cannot be undone.`)) {
    return
  }

  deletingCredential.value = key
  try {
    await $fetch('/api/bot/credentials', {
      method: 'DELETE',
      query: { exchange: key, environment: currentEnv }
    })
    
    const envKey = currentEnv as 'production' | 'practice'
    Object.assign(credentialStore[key][envKey], createCredentialForm(credentialTitle(key), currentEnv))
    
    toast.add({
      title: `✓ ${credentialTitle(key)} (${envLabel}) Removed`,
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

onMounted(() => {
  loadCredentials()
})

definePageMeta({
  title: 'API Keys',
  description: 'Manage your exchange API keys securely'
})
</script>

<style scoped>
.compact-card :deep(.card-content),
.compact-card :deep(> div:not(:first-child):not(:last-child)) {
  padding-bottom: 0.5rem !important;
}

.compact-card :deep(> div:last-child) {
  padding-bottom: 0.5rem !important;
}
</style>

