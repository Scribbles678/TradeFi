<template>
  <div class="space-y-8 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-semibold text-foreground">Account Overview</h1>
        <p class="text-muted-foreground text-sm mt-1">View your account information, system health, and usage</p>
      </div>
      <Button
        size="sm"
        @click="loadBalances"
        :disabled="isLoading"
      >
        <Icon name="i-heroicons-arrow-path" class="w-4 h-4 mr-1" />
        Refresh
      </Button>
    </div>

    <!-- Overview Content -->
    <div class="space-y-6">
            <!-- User Profile & Subscription Status -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- User Profile Card -->
              <Card>
                <CardHeader>
                  <div class="flex items-center gap-2">
                    <Icon name="i-heroicons-user-circle" class="w-5 h-5 text-muted-foreground" />
                    <CardTitle>User Profile</CardTitle>
                  </div>
                </CardHeader>
                <CardContent class="space-y-4">
                  <div>
                    <p class="text-sm text-muted-foreground">Name</p>
                    <p class="text-lg font-semibold mt-1 text-foreground">{{ userProfile.name }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-muted-foreground">Email</p>
                    <p class="text-lg font-semibold mt-1 text-foreground">{{ userProfile.email }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-muted-foreground">Member Since</p>
                    <p class="text-lg font-semibold mt-1 text-foreground">{{ userProfile.joinDate }}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    class="w-full"
                    @click="editProfile"
                  >
                    <Icon name="i-heroicons-pencil" class="w-4 h-4 mr-1" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              <!-- Subscription Status Card -->
              <Card>
                <CardHeader>
                  <div class="flex items-center gap-2">
                    <Icon name="i-heroicons-credit-card" class="w-5 h-5 text-muted-foreground" />
                    <CardTitle>Subscription Status</CardTitle>
                  </div>
                </CardHeader>
                <CardContent class="space-y-4">
                  <div>
                    <p class="text-sm text-muted-foreground">Current Plan</p>
                    <div class="flex items-center gap-2 mt-1">
                      <p class="text-lg font-semibold text-foreground">{{ subscription.plan || 'Pro' }}</p>
                      <Badge :variant="subscription.status === 'active' ? 'success' : 'pending'" class="text-xs">
                        {{ subscription.status === 'active' ? 'Active' : 'Inactive' }}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm text-muted-foreground">Next Billing Date</p>
                    <p class="text-lg font-semibold mt-1 text-foreground">{{ subscription.nextBilling || 'Mar 15, 2024' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-muted-foreground">Monthly Cost</p>
                    <p class="text-lg font-semibold mt-1 text-foreground">${{ subscription.cost || '99.00' }}/mo</p>
                  </div>
                  <Button
                    size="sm"
                    class="w-full"
                    @click="navigateTo('/account/subscription')"
                  >
                    <Icon name="i-heroicons-cog-6-tooth" class="w-4 h-4 mr-1" />
                    Manage Subscription
                  </Button>
                </CardContent>
              </Card>
            </div>

            <!-- System Health Status -->
            <Card>
              <CardHeader>
                <div class="flex items-center gap-2">
                  <Icon name="i-heroicons-cpu-chip" class="w-5 h-5 text-muted-foreground" />
                  <CardTitle>System Health</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <!-- Sparky Bot Status -->
                  <div class="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <div class="flex-shrink-0">
                      <div :class="[
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        systemHealth.botOnline ? 'bg-green-500/20' : 'bg-red-500/20'
                      ]">
                        <Icon 
                          name="i-heroicons-server" 
                          :class="systemHealth.botOnline ? 'text-green-400' : 'text-red-400'" 
                          class="w-5 h-5" 
                        />
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs text-muted-foreground">Sparky Bot</p>
                      <p :class="[
                        'text-sm font-semibold',
                        systemHealth.botOnline ? 'text-green-400' : 'text-red-400'
                      ]">
                        {{ systemHealth.botOnline ? 'Online' : 'Offline' }}
                      </p>
                    </div>
                  </div>

                  <!-- Last Webhook -->
                  <div class="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <div class="flex-shrink-0">
                      <div class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Icon name="i-heroicons-bolt" class="text-blue-400 w-5 h-5" />
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs text-muted-foreground">Last Webhook</p>
                      <p class="text-sm font-semibold truncate text-foreground">{{ systemHealth.lastWebhook }}</p>
                    </div>
                  </div>

                  <!-- API Connections -->
                  <div class="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <div class="flex-shrink-0">
                      <div :class="[
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        connectedExchangesCount >= 3 ? 'bg-green-500/20' : 'bg-yellow-500/20'
                      ]">
                        <Icon 
                          name="i-heroicons-link" 
                          :class="connectedExchangesCount >= 3 ? 'text-green-400' : 'text-yellow-400'" 
                          class="w-5 h-5" 
                        />
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs text-muted-foreground">API Connections</p>
                      <p class="text-sm font-semibold text-foreground">{{ connectedExchangesCount }}/4 Active</p>
                    </div>
                  </div>

                  <!-- System Alerts -->
                  <div class="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <div class="flex-shrink-0">
                      <div :class="[
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        systemHealth.alertsCount === 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                      ]">
                        <Icon 
                          :name="systemHealth.alertsCount === 0 ? 'i-heroicons-check-circle' : 'i-heroicons-exclamation-triangle'" 
                          :class="systemHealth.alertsCount === 0 ? 'text-green-400' : 'text-red-400'" 
                          class="w-5 h-5" 
                        />
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs text-muted-foreground">System Alerts</p>
                      <p :class="[
                        'text-sm font-semibold',
                        systemHealth.alertsCount === 0 ? 'text-green-400' : 'text-red-400'
                      ]">
                        {{ systemHealth.alertsCount === 0 ? 'No Issues' : `${systemHealth.alertsCount} Alert${systemHealth.alertsCount > 1 ? 's' : ''}` }}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Usage & Limits -->
            <Card>
              <CardHeader>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <Icon name="i-heroicons-chart-bar" class="w-5 h-5 text-muted-foreground" />
                    <CardTitle>Usage & Limits</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="viewUsageDetails"
                  >
                    View Full Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <!-- Exchanges Used -->
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <p class="text-sm text-muted-foreground">Active Exchanges</p>
                      <div class="flex items-center gap-2">
                        <p class="text-sm font-semibold text-foreground">{{ usage.exchangesUsed }}/{{ usage.exchangesLimit }}</p>
                        <Icon 
                          v-if="getUsageLevel(usage.exchangesUsed, usage.exchangesLimit) === 'warning'" 
                          name="i-heroicons-exclamation-triangle" 
                          class="w-4 h-4 text-yellow-400" 
                        />
                        <Icon 
                          v-if="getUsageLevel(usage.exchangesUsed, usage.exchangesLimit) === 'critical'" 
                          name="i-heroicons-exclamation-circle" 
                          class="w-4 h-4 text-red-400" 
                        />
                      </div>
                    </div>
                    <div class="w-full bg-muted rounded-full h-2.5">
                      <div 
                        :class="getUsageBarColor(usage.exchangesUsed, usage.exchangesLimit)"
                        class="h-2.5 rounded-full transition-all"
                        :style="{ width: `${getUsagePercent(usage.exchangesUsed, usage.exchangesLimit)}%` }"
                      ></div>
                    </div>
                    <div class="flex items-center justify-between">
                      <p class="text-xs text-muted-foreground">
                        {{ usage.exchangesLimit === Infinity ? 'Unlimited' : `${Math.round(getUsagePercent(usage.exchangesUsed, usage.exchangesLimit))}% used` }}
                      </p>
                      <p v-if="getUsageLevel(usage.exchangesUsed, usage.exchangesLimit) === 'critical'" class="text-xs text-red-400 font-semibold">
                        At limit!
                      </p>
                    </div>
                    <Button
                      v-if="getUsageLevel(usage.exchangesUsed, usage.exchangesLimit) !== 'safe'"
                      variant="outline"
                      size="sm"
                      class="w-full mt-2"
                      @click="navigateTo('/account/subscription')"
                    >
                      Upgrade Plan
                    </Button>
                  </div>

                  <!-- Strategies Used -->
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <p class="text-sm text-muted-foreground">Active Strategies</p>
                      <div class="flex items-center gap-2">
                        <p class="text-sm font-semibold text-foreground">{{ usage.strategiesUsed }}/{{ usage.strategiesLimit === Infinity ? '∞' : usage.strategiesLimit }}</p>
                        <Icon 
                          v-if="getUsageLevel(usage.strategiesUsed, usage.strategiesLimit) === 'warning'" 
                          name="i-heroicons-exclamation-triangle" 
                          class="w-4 h-4 text-yellow-400" 
                        />
                        <Icon 
                          v-if="getUsageLevel(usage.strategiesUsed, usage.strategiesLimit) === 'critical'" 
                          name="i-heroicons-exclamation-circle" 
                          class="w-4 h-4 text-red-400" 
                        />
                      </div>
                    </div>
                    <div class="w-full bg-muted rounded-full h-2.5">
                      <div 
                        :class="getUsageBarColor(usage.strategiesUsed, usage.strategiesLimit)"
                        class="h-2.5 rounded-full transition-all"
                        :style="{ width: `${getUsagePercent(usage.strategiesUsed, usage.strategiesLimit)}%` }"
                      ></div>
                    </div>
                    <div class="flex items-center justify-between">
                      <p class="text-xs text-muted-foreground">
                        {{ usage.strategiesLimit === Infinity ? 'Unlimited' : `${Math.round(getUsagePercent(usage.strategiesUsed, usage.strategiesLimit))}% used` }}
                      </p>
                      <p v-if="getUsageLevel(usage.strategiesUsed, usage.strategiesLimit) === 'critical'" class="text-xs text-red-400 font-semibold">
                        At limit!
                      </p>
                    </div>
                    <Button
                      v-if="getUsageLevel(usage.strategiesUsed, usage.strategiesLimit) !== 'safe'"
                      variant="outline"
                      size="sm"
                      class="w-full mt-2"
                      @click="navigateTo('/account/subscription')"
                    >
                      Upgrade Plan
                    </Button>
                  </div>

                  <!-- Webhooks This Month -->
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <p class="text-sm text-muted-foreground">Webhooks (This Month)</p>
                      <div class="flex items-center gap-2">
                        <p class="text-sm font-semibold text-foreground">{{ usage.webhooksUsed }}/{{ usage.webhooksLimit === Infinity ? '∞' : usage.webhooksLimit }}</p>
                        <Icon 
                          v-if="getUsageLevel(usage.webhooksUsed, usage.webhooksLimit) === 'warning'" 
                          name="i-heroicons-exclamation-triangle" 
                          class="w-4 h-4 text-yellow-400" 
                        />
                        <Icon 
                          v-if="getUsageLevel(usage.webhooksUsed, usage.webhooksLimit) === 'critical'" 
                          name="i-heroicons-exclamation-circle" 
                          class="w-4 h-4 text-red-400" 
                        />
                      </div>
                    </div>
                    <div class="w-full bg-muted rounded-full h-2.5">
                      <div 
                        :class="getUsageBarColor(usage.webhooksUsed, usage.webhooksLimit)"
                        class="h-2.5 rounded-full transition-all"
                        :style="{ width: `${getUsagePercent(usage.webhooksUsed, usage.webhooksLimit)}%` }"
                      ></div>
                    </div>
                    <div class="flex items-center justify-between">
                      <p class="text-xs text-muted-foreground">
                        {{ usage.webhooksLimit === Infinity ? 'Unlimited' : `${Math.round(getUsagePercent(usage.webhooksUsed, usage.webhooksLimit))}% used` }}
                      </p>
                      <p v-if="getUsageLevel(usage.webhooksUsed, usage.webhooksLimit) === 'critical'" class="text-xs text-red-400 font-semibold">
                        At limit!
                      </p>
                    </div>
                    <Button
                      v-if="getUsageLevel(usage.webhooksUsed, usage.webhooksLimit) !== 'safe'"
                      variant="outline"
                      size="sm"
                      class="w-full mt-2"
                      @click="navigateTo('/account/subscription')"
                    >
                      Upgrade Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Subscription {
  plan: string
  status: string
  cost: string
  nextBilling: string
  paymentMethod?: string
}

interface Usage {
  exchangesUsed: number
  exchangesLimit: number | typeof Infinity
  strategiesUsed: number
  strategiesLimit: number | typeof Infinity
  webhooksUsed: number
  webhooksLimit: number | typeof Infinity
}

interface ExchangeBalance {
  success: boolean
  exchange?: string
  balance?: number | null
  error?: string
  [key: string]: any
}

// Get authenticated user
const user = useSupabaseUser()

// User Profile (from Supabase Auth)
const userProfile = computed(() => {
  if (!user.value) return { name: '', email: '', joinDate: '' }
  
  const createdAt = user.value.created_at ? new Date(user.value.created_at) : new Date()
  const joinDate = createdAt.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
  
  return {
    name: user.value.email?.split('@')[0] || 'User',
    email: user.value.email || '',
    joinDate
  }
})

// Subscription (Mock Data)
const subscription = ref<Subscription>({
  plan: 'Pro',
  status: 'active',
  cost: '99.00',
  nextBilling: 'Mar 15, 2024',
  paymentMethod: '•••• •••• •••• 4242'
})

// Usage (Mock Data)
const usage = ref<Usage>({
  exchangesUsed: 3,
  exchangesLimit: 4,
  strategiesUsed: 8,
  strategiesLimit: Infinity,
  webhooksUsed: 1245,
  webhooksLimit: Infinity
})

// System Health
const systemHealth = ref({
  botOnline: true,
  lastWebhook: '2 min ago',
  alertsCount: 0
})

// State for balances (for connectedExchangesCount)
const asterBalance = ref<ExchangeBalance>({ success: false })
const oandaBalance = ref<ExchangeBalance>({ success: false })
const tradierBalance = ref<ExchangeBalance>({ success: false })
const tastytradeBalance = ref<ExchangeBalance>({ success: false, disabled: false })

// Connected Exchanges Count
const connectedExchangesCount = computed(() => {
  let count = 0
  if (asterBalance.value.success) count++
  if (oandaBalance.value.success) count++
  if (tradierBalance.value.success) count++
  if (tastytradeBalance.value.success && !tastytradeBalance.value.disabled) count++
  return count
})

// Usage Helper Functions
function getUsagePercent(used: number, limit: number | typeof Infinity): number {
  if (limit === Infinity) return 100
  return Math.min((used / limit) * 100, 100)
}

function getUsageLevel(used: number, limit: number | typeof Infinity): 'safe' | 'warning' | 'critical' {
  if (limit === Infinity) return 'safe'
  const percent = (used / limit) * 100
  if (percent >= 100) return 'critical'
  if (percent >= 80) return 'warning'
  return 'safe'
}

function getUsageBarColor(used: number, limit: number | typeof Infinity): string {
  const level = getUsageLevel(used, limit)
  if (level === 'critical') return 'bg-red-600'
  if (level === 'warning') return 'bg-yellow-500'
  return 'bg-blue-600'
}

// Load balances from APIs (for connection status)
const isLoading = ref(false)

async function loadBalances() {
  isLoading.value = true
  try {
    const [aster, oanda, tradier, tastytrade] = await Promise.all([
      $fetch('/api/balance/aster').catch(e => ({ success: false, error: e.message })),
      $fetch('/api/balance/oanda').catch(e => ({ success: false, error: e.message })),
      $fetch('/api/balance/tradier').catch(e => ({ success: false, error: e.message })),
      $fetch('/api/balance/tastytrade').catch(e => ({ success: false, error: e.message, disabled: true }))
    ])

    asterBalance.value = aster as ExchangeBalance
    oandaBalance.value = oanda as ExchangeBalance
    tradierBalance.value = tradier as ExchangeBalance
    tastytradeBalance.value = tastytrade as ExchangeBalance

    // Update system health based on API errors
    const errors = [
      !asterBalance.value.success,
      !oandaBalance.value.success,
      !tradierBalance.value.success,
      !tastytradeBalance.value.disabled && !tastytradeBalance.value.success
    ].filter(Boolean).length
    
    systemHealth.value.alertsCount = errors
  } catch (error) {
    console.error('Error loading balances:', error)
    systemHealth.value.alertsCount = 1
  } finally {
    isLoading.value = false
  }
}

// Placeholder Functions
function editProfile() {
  alert('Edit Profile - Coming Soon!')
}

function viewUsageDetails() {
  alert('Usage Details - Coming Soon!')
}

// Load on mount
onMounted(() => {
  loadBalances()
  setInterval(loadBalances, 30000)
})

definePageMeta({
  title: 'Account Overview',
  description: 'View your account information, system health, and usage'
})
</script>

