<template>
  <div class="space-y-8 p-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-semibold text-foreground">Webhook Configuration</h1>
      <p class="text-muted-foreground text-sm mt-1">Configure your webhook to receive TradingView alerts</p>
    </div>

    <!-- Webhook URL Card -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-2">
          <Icon name="i-heroicons-link" class="w-5 h-5 text-muted-foreground" />
          <CardTitle>Webhook Configuration</CardTitle>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <div>
          <Label class="text-sm font-medium text-foreground mb-2 block">Webhook URL</Label>
          <div class="flex flex-col gap-3">
            <div class="flex flex-col md:flex-row gap-2 items-stretch">
              <Input
                :model-value="webhookUrl"
                :readonly="true"
                placeholder="Generating webhook URL..."
                class="flex-1 bg-muted/50"
              />
              <Button
                variant="outline"
                size="sm"
                @click="copyWebhookUrl"
              >
                <Icon name="i-heroicons-clipboard-document" class="w-4 h-4 mr-1" />
                Copy URL
              </Button>
            </div>
            <p class="text-xs text-muted-foreground">
              This URL points to your Sparky trading bot server. Use this in your TradingView alerts.
            </p>
          </div>
        </div>
        <div>
          <Label class="text-sm font-medium text-foreground mb-2 block">Webhook Secret</Label>
          <div class="flex flex-col gap-3">
            <div class="flex flex-col md:flex-row gap-2 items-stretch">
              <Input
                v-model="webhookSecret"
                :type="showWebhookSecret ? 'text' : 'password'"
                placeholder="Enter webhook secret"
                class="flex-1"
                :disabled="loading"
              />
              <Button
                variant="ghost"
                size="sm"
                @click="showWebhookSecret = !showWebhookSecret"
                :disabled="loading"
              >
                <Icon :name="showWebhookSecret ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-4 h-4 mr-1" />
                {{ showWebhookSecret ? 'Hide' : 'Show' }}
              </Button>
            </div>
            <div class="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                @click="copyWebhookSecret"
                :disabled="!webhookSecret || loading"
              >
                <Icon name="i-heroicons-clipboard-document" class="w-4 h-4 mr-1" />
                Copy Secret
              </Button>
              <Button
                size="sm"
                :disabled="saving || loading || !webhookSecret"
                @click="saveWebhookSecret"
              >
                <Icon v-if="saving" name="i-heroicons-arrow-path" class="w-4 h-4 mr-1 animate-spin" />
                <Icon v-else name="i-heroicons-check" class="w-4 h-4 mr-1" />
                {{ saving ? 'Saving...' : 'Save Secret' }}
              </Button>
              <Button
                variant="outline"
                size="sm"
                :disabled="saving || loading"
                @click="regenerateWebhookSecret"
              >
                <Icon name="i-heroicons-arrow-path" class="w-4 h-4 mr-1" />
                Regenerate
              </Button>
              <Button
                variant="ghost"
                size="sm"
                :disabled="deleting || loading || !webhookSecret"
                @click="deleteWebhookSecret"
              >
                <Icon v-if="deleting" name="i-heroicons-arrow-path" class="w-4 h-4 mr-1 animate-spin" />
                <Icon v-else name="i-heroicons-trash" class="w-4 h-4 mr-1" />
                {{ deleting ? 'Clearing...' : 'Clear' }}
              </Button>
            </div>
            <p class="text-xs text-muted-foreground">
              ⚠️ Keep your secret secure. Never share it publicly. Regenerating will invalidate existing TradingView alerts.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- TradingView Setup Guide -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-2">
          <Icon name="i-heroicons-academic-cap" class="w-5 h-5 text-muted-foreground" />
          <CardTitle>TradingView Alert Setup</CardTitle>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <p class="text-sm font-medium text-foreground">Step-by-step instructions:</p>
          <ol class="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Go to your TradingView chart</li>
            <li>Click "Create Alert" on the chart</li>
            <li>Set your alert conditions</li>
            <li>In the "Webhook URL" field, paste the webhook URL above</li>
            <li>In the "Alert Message" field, use this JSON template:</li>
          </ol>
        </div>
        <div>
          <Label class="text-sm font-medium text-foreground mb-2 block">JSON Template</Label>
          <div class="bg-card border rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre class="text-foreground">{{ webhookTemplate }}</pre>
          </div>
          <div class="flex gap-2 mt-2">
            <Button
              size="sm"
              @click="copyWebhookTemplate"
              :disabled="!webhookSecret"
            >
              <Icon name="i-heroicons-clipboard-document" class="w-4 h-4 mr-1" />
              Copy Template
            </Button>
            <Button
              variant="ghost"
              size="sm"
              @click="viewWebhookGuide"
            >
              <Icon name="i-heroicons-document-text" class="w-4 h-4 mr-1" />
              View Full Guide
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Recent Webhook Activity -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Icon name="i-heroicons-clock" class="w-5 h-5 text-muted-foreground" />
            <CardTitle>Recent Webhook Activity</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            @click="viewWebhookLogs"
          >
            View All Logs
          </Button>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- Summary Stats -->
        <div class="grid grid-cols-3 gap-4 pb-4 border-b border-border">
          <div class="text-center">
            <p class="text-2xl font-bold text-foreground">{{ webhookActivity.received24h || 0 }}</p>
            <p class="text-xs text-muted-foreground mt-1">Last 24 hours</p>
          </div>
          <div class="text-center">
            <Badge 
              :variant="webhookActivity.status === 'success' ? 'success' : webhookActivity.status === 'error' ? 'error' : 'warning'" 
              class="text-xs"
            >
              {{ webhookActivity.status === 'success' ? 'All successful' : webhookActivity.status === 'error' ? 'Errors found' : 'No activity' }}
            </Badge>
            <p class="text-xs text-muted-foreground mt-1">Status</p>
          </div>
          <div class="text-center">
            <p class="text-sm font-semibold text-foreground">{{ webhookActivity.lastReceived || 'Never' }}</p>
            <p class="text-xs text-muted-foreground mt-1">Last webhook</p>
          </div>
        </div>

        <!-- Recent Webhook Requests Table -->
        <div v-if="loadingActivity" class="flex items-center justify-center py-8">
          <Icon name="i-heroicons-arrow-path" class="w-5 h-5 text-muted-foreground animate-spin mr-2" />
          <span class="text-sm text-muted-foreground">Loading activity...</span>
        </div>
        <div v-else-if="recentWebhooks.length === 0" class="text-center py-8 text-muted-foreground">
          <Icon name="i-heroicons-inbox" class="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p class="text-sm">No webhook activity yet</p>
          <p class="text-xs mt-1">Webhook requests will appear here once received</p>
        </div>
        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Exchange</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead class="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow 
              v-for="webhook in recentWebhooks" 
              :key="webhook.id"
              class="hover:bg-accent"
            >
              <TableCell class="text-sm text-muted-foreground">
                {{ formatWebhookTime(webhook.created_at) }}
              </TableCell>
              <TableCell>
                <Badge variant="outline" class="text-xs">
                  {{ webhook.exchange || 'unknown' }}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  :variant="webhook.action === 'buy' ? 'success' : webhook.action === 'sell' ? 'error' : 'outline'" 
                  class="text-xs uppercase"
                >
                  {{ webhook.action || 'unknown' }}
                </Badge>
              </TableCell>
              <TableCell class="font-mono font-semibold text-sm">
                {{ webhook.symbol || '—' }}
              </TableCell>
              <TableCell class="text-right">
                <Badge 
                  :variant="webhook.status === 'processed' ? 'success' : webhook.status === 'failed' ? 'error' : webhook.status === 'rate_limited' ? 'warning' : 'outline'" 
                  class="text-xs"
                >
                  {{ formatStatus(webhook.status) }}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <!-- Actions -->
        <div class="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            @click="testWebhook"
            :disabled="!webhookSecret || testing"
          >
            <Icon v-if="testing" name="i-heroicons-arrow-path" class="w-4 h-4 mr-1 animate-spin" />
            <Icon v-else name="i-heroicons-bolt" class="w-4 h-4 mr-1" />
            {{ testing ? 'Testing...' : 'Test Webhook' }}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface WebhookActivity {
  received24h: number
  lastReceived: string
  status: 'success' | 'warning' | 'error'
}

interface WebhookRequest {
  id: string
  exchange: string
  action: string
  symbol: string
  status: 'pending' | 'processed' | 'failed' | 'rate_limited'
  created_at: string
  processed_at?: string | null
  error_message?: string | null
}

interface BotCredentialRecord {
  id: string
  exchange: string
  label: string
  environment: string
  webhook_secret?: string | null
  created_at: string
  updated_at: string
}

const toast = useToast()

// State
const webhookSecret = ref('')
const showWebhookSecret = ref(false)
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const testing = ref(false)
const loadingActivity = ref(false)
const webhookCredentialId = ref<string | null>(null)
const recentWebhooks = ref<WebhookRequest[]>([])

// Webhook URL - points to Sparky bot server (Digital Ocean droplet)
// Configured via SPARKY_WEBHOOK_URL environment variable
// Falls back to http://134.122.8.18/webhook if env var is not set
const runtimeConfig = useRuntimeConfig()
const webhookUrl = computed(() => {
  return runtimeConfig.public?.sparkyWebhookUrl || 'http://134.122.8.18/webhook'
})

const webhookTemplate = computed(() => `{
  "secret": "${webhookSecret.value || 'YOUR_SECRET_HERE'}",
  "exchange": "aster",
  "action": "buy",
  "symbol": "{{ticker}}"
}`)

const webhookActivity = ref<WebhookActivity>({
  received24h: 0,
  lastReceived: 'Never',
  status: 'warning'
})

// Load webhook credentials from database
async function loadWebhookCredentials() {
  loading.value = true
  try {
    const response = await $fetch<{ data: BotCredentialRecord[] }>('/api/bot/credentials')
    const webhookCred = response.data?.find(cred => cred.exchange === 'webhook')
    
    if (webhookCred) {
      webhookCredentialId.value = webhookCred.id
      webhookSecret.value = webhookCred.webhook_secret || ''
    }
  } catch (error) {
    console.error('Failed to load webhook credentials', error)
    toast.add({
      title: 'Unable to load webhook configuration',
      color: 'error',
      description: 'Check your connection and try again.'
    })
  } finally {
    loading.value = false
  }
}

// Save webhook secret to database
async function saveWebhookSecret() {
  if (!webhookSecret.value.trim()) {
    toast.add({
      title: 'Secret required',
      color: 'error',
      description: 'Please enter a webhook secret before saving.'
    })
    return
  }

  saving.value = true
  try {
    const payload = {
      exchange: 'webhook',
      webhookSecret: webhookSecret.value.trim(),
      label: 'TradingView Webhook'
    }

    const response = await $fetch<{ success: boolean; credential: BotCredentialRecord }>('/api/bot/credentials', {
      method: 'POST',
      body: payload
    })

    if (response.success) {
      webhookCredentialId.value = response.credential.id
      toast.add({
        title: '✓ Webhook secret saved',
        description: 'Your webhook secret has been saved successfully.',
        color: 'success',
        icon: 'i-heroicons-check-circle'
      })
    }
  } catch (error: any) {
    console.error('Failed to save webhook secret:', error)
    toast.add({
      title: 'Failed to save',
      color: 'error',
      description: error?.data || error?.message || 'An error occurred while saving.'
    })
  } finally {
    saving.value = false
  }
}

// Regenerate webhook secret - generates new secret AND saves it
async function regenerateWebhookSecret() {
  if (!confirm('Are you sure you want to regenerate your webhook secret? This will invalidate your current TradingView alerts. You will need to update all your TradingView alerts with the new secret.')) {
    return
  }

  saving.value = true
  try {
    // Generate a new secure random secret
    const newSecret = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 18)}`
    
    // Update the local state
    webhookSecret.value = newSecret
    
    // Save it to the database
    const payload = {
      exchange: 'webhook',
      webhookSecret: newSecret,
      label: 'TradingView Webhook'
    }

    const response = await $fetch<{ success: boolean; credential: BotCredentialRecord }>('/api/bot/credentials', {
      method: 'POST',
      body: payload
    })

    if (response.success) {
      webhookCredentialId.value = response.credential.id
      toast.add({
        title: '✓ Secret regenerated',
        description: 'A new webhook secret has been generated and saved. Update your TradingView alerts with the new secret.',
        color: 'success',
        icon: 'i-heroicons-check-circle'
      })
    }
  } catch (error: any) {
    console.error('Failed to regenerate webhook secret:', error)
    toast.add({
      title: 'Failed to regenerate',
      color: 'error',
      description: error?.data || error?.message || 'An error occurred while regenerating.'
    })
  } finally {
    saving.value = false
  }
}

// Delete webhook secret from database
async function deleteWebhookSecret() {
  if (!confirm('Clear the stored webhook secret? Existing TradingView alerts will stop working.')) {
    return
  }

  deleting.value = true
  try {
    await $fetch('/api/bot/credentials', {
      method: 'DELETE',
      query: {
        exchange: 'webhook',
        environment: 'production'
      }
    })

    webhookSecret.value = ''
    webhookCredentialId.value = null
    
    toast.add({
      title: 'Webhook secret cleared',
      description: 'The webhook secret has been removed from your account.',
      color: 'warning',
      icon: 'i-heroicons-information-circle'
    })
  } catch (error: any) {
    console.error('Failed to delete webhook secret:', error)
    toast.add({
      title: 'Failed to clear',
      color: 'error',
      description: error?.data || error?.message || 'An error occurred while clearing.'
    })
  } finally {
    deleting.value = false
  }
}

// Copy functions
function copyWebhookUrl() {
  navigator.clipboard.writeText(webhookUrl.value).then(() => {
    toast.add({
      title: 'Webhook URL copied',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })
  }).catch(() => {
    toast.add({
      title: 'Failed to copy',
      color: 'error'
    })
  })
}

function copyWebhookSecret() {
  if (!webhookSecret.value) {
    toast.add({
      title: 'No secret to copy',
      color: 'warning'
    })
    return
  }
  
  navigator.clipboard.writeText(webhookSecret.value).then(() => {
    toast.add({
      title: 'Webhook secret copied',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })
  }).catch(() => {
    toast.add({
      title: 'Failed to copy',
      color: 'error'
    })
  })
}

function copyWebhookTemplate() {
  if (!webhookSecret.value) {
    toast.add({
      title: 'Save secret first',
      color: 'warning',
      description: 'Please save a webhook secret before copying the template.'
    })
    return
  }
  
  navigator.clipboard.writeText(webhookTemplate.value).then(() => {
    toast.add({
      title: 'Template copied',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })
  }).catch(() => {
    toast.add({
      title: 'Failed to copy',
      color: 'error'
    })
  })
}

// Placeholder functions for future implementation
function viewWebhookGuide() {
  toast.add({
    title: 'Webhook Guide',
    description: 'Full webhook setup guide coming soon!',
    color: 'info'
  })
}

function viewWebhookLogs() {
  toast.add({
    title: 'Webhook Logs',
    description: 'Webhook activity logs coming soon!',
    color: 'info'
  })
}

async function testWebhook() {
  if (!webhookSecret.value) {
    toast.add({
      title: 'Secret required',
      color: 'warning',
      description: 'Please save a webhook secret before testing.'
    })
    return
  }

  testing.value = true
  try {
    // TODO: Implement actual webhook test endpoint
    // For now, just show a success message
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.add({
      title: 'Test webhook',
      description: 'Webhook testing functionality coming soon!',
      color: 'info'
    })
  } catch (error) {
    toast.add({
      title: 'Test failed',
      color: 'error',
      description: 'An error occurred while testing the webhook.'
    })
  } finally {
    testing.value = false
  }
}

// Load webhook activity from database
async function loadWebhookActivity() {
  loadingActivity.value = true
  try {
    // Fetch recent webhook requests (last 10)
    const response = await $fetch<{ data: WebhookRequest[] }>('/api/webhook/activity', {
      query: {
        limit: 10
      }
    }).catch(() => ({ data: [] }))

    recentWebhooks.value = response.data || []

    // Calculate summary stats
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last24hCount = recentWebhooks.value.filter(w => new Date(w.created_at) >= last24h).length
    
    const lastWebhook = recentWebhooks.value[0]
    const lastReceived = lastWebhook 
      ? formatWebhookTime(lastWebhook.created_at)
      : 'Never'

    const hasErrors = recentWebhooks.value.some(w => w.status === 'failed' || w.status === 'rate_limited')
    const status = hasErrors ? 'error' : recentWebhooks.value.length > 0 ? 'success' : 'warning'

    webhookActivity.value = {
      received24h: last24hCount,
      lastReceived,
      status
    }
  } catch (error) {
    console.error('Failed to load webhook activity:', error)
    webhookActivity.value = {
      received24h: 0,
      lastReceived: 'Never',
      status: 'warning'
    }
    recentWebhooks.value = []
  } finally {
    loadingActivity.value = false
  }
}

// Format webhook time
function formatWebhookTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Format status for display
function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'processed': 'Processed',
    'pending': 'Pending',
    'failed': 'Failed',
    'rate_limited': 'Rate Limited'
  }
  return statusMap[status] || status
}

// Load on mount
onMounted(async () => {
  await Promise.all([
    loadWebhookCredentials(),
    loadWebhookActivity()
  ])
})

definePageMeta({
  title: 'Webhook Configuration',
  description: 'Configure your webhook to receive TradingView alerts'
})
</script>
