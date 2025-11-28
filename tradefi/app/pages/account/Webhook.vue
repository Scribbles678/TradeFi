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
                v-model="webhookUrl"
                placeholder="https://your-sparky-bot/webhook"
                class="flex-1"
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
            <div class="flex flex-wrap gap-2">
              <Button
                size="sm"
                :disabled="savingCredential === 'webhook'"
                @click="saveWebhookUrl"
              >
                <Icon name="i-heroicons-check" class="w-4 h-4 mr-1" />
                Save Webhook URL
              </Button>
              <Button
                variant="ghost"
                size="sm"
                @click="resetWebhookUrl"
              >
                <Icon name="i-heroicons-arrow-path" class="w-4 h-4 mr-1" />
                Reset to Default
              </Button>
            </div>
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
              />
              <Button
                variant="ghost"
                size="sm"
                @click="showWebhookSecret = !showWebhookSecret"
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
              >
                <Icon name="i-heroicons-clipboard-document" class="w-4 h-4 mr-1" />
                Copy Secret
              </Button>
              <Button
                size="sm"
                :disabled="savingCredential === 'webhook'"
                @click="saveWebhookSecret"
              >
                <Icon name="i-heroicons-check" class="w-4 h-4 mr-1" />
                Save Secret
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="regenerateWebhookSecret"
              >
                <Icon name="i-heroicons-arrow-path" class="w-4 h-4 mr-1" />
                Regenerate
              </Button>
              <Button
                variant="ghost"
                size="sm"
                :disabled="deletingCredential === 'webhook'"
                @click="deleteWebhookSecret"
              >
                <Icon name="i-heroicons-trash" class="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
            <p class="text-xs text-muted-foreground">
              ⚠️ Keep your secret secure. Never share it publicly.
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
      <CardContent>
        <div class="space-y-3">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Last 24 hours:</span>
            <span class="font-semibold text-foreground">{{ webhookActivity.received24h || '45' }} webhooks received</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Status:</span>
            <Badge variant="success" class="text-xs">All successful ✓</Badge>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Last webhook:</span>
            <span class="font-semibold text-foreground">{{ webhookActivity.lastReceived || '2 minutes ago' }}</span>
          </div>
          <div class="pt-2">
            <Button
              variant="outline"
              size="sm"
              @click="testWebhook"
            >
              <Icon name="i-heroicons-bolt" class="w-4 h-4 mr-1" />
              Test Webhook
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface WebhookActivity {
  received24h: number
  lastReceived: string
}

const runtimeConfig = useRuntimeConfig()
const toast = useToast()

const webhookUrl = ref(runtimeConfig.public?.sparkyWebhookUrl || 'http://localhost:3000/webhook')
const webhookSecret = ref('')
const showWebhookSecret = ref(false)
const savingCredential = ref<string | null>(null)
const deletingCredential = ref<string | null>(null)

const webhookTemplate = computed(() => `{
  "secret": "${webhookSecret.value}",
  "exchange": "aster",
  "action": "buy",
  "symbol": "{{ticker}}"
}`)

const webhookActivity = ref<WebhookActivity>({
  received24h: 45,
  lastReceived: '2 minutes ago'
})

function copyWebhookUrl() {
  navigator.clipboard.writeText(webhookUrl.value).then(() => {
    toast.add({
      title: 'Webhook URL copied',
      color: 'success'
    })
  }).catch(() => {
    toast.add({
      title: 'Failed to copy',
      color: 'error'
    })
  })
}

function copyWebhookSecret() {
  navigator.clipboard.writeText(webhookSecret.value).then(() => {
    toast.add({
      title: 'Webhook secret copied',
      color: 'success'
    })
  }).catch(() => {
    toast.add({
      title: 'Failed to copy',
      color: 'error'
    })
  })
}

function copyWebhookTemplate() {
  navigator.clipboard.writeText(webhookTemplate.value).then(() => {
    toast.add({
      title: 'Template copied',
      color: 'success'
    })
  }).catch(() => {
    toast.add({
      title: 'Failed to copy',
      color: 'error'
    })
  })
}

function resetWebhookUrl() {
  webhookUrl.value = runtimeConfig.public?.sparkyWebhookUrl || 'http://localhost:3000/webhook'
}

async function saveWebhookUrl() {
  savingCredential.value = 'webhook'
  try {
    // Save webhook URL logic here
    toast.add({
      title: 'Webhook URL saved',
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Failed to save',
      color: 'error'
    })
  } finally {
    savingCredential.value = null
  }
}

async function saveWebhookSecret() {
  savingCredential.value = 'webhook'
  try {
    // Save webhook secret logic here
    toast.add({
      title: 'Webhook secret saved',
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Failed to save',
      color: 'error'
    })
  } finally {
    savingCredential.value = null
  }
}

async function regenerateWebhookSecret() {
  if (!confirm('Are you sure you want to regenerate your webhook secret? This will invalidate your current TradingView alerts.')) {
    return
  }
  webhookSecret.value = crypto.randomUUID?.() || Math.random().toString(36).slice(2, 18)
}

async function deleteWebhookSecret() {
  if (!confirm('Clear the stored webhook secret? Existing alerts will stop working.')) {
    return
  }
  deletingCredential.value = 'webhook'
  try {
    // Delete webhook secret logic here
    webhookSecret.value = ''
    toast.add({
      title: 'Webhook secret cleared',
      color: 'warning'
    })
  } catch (error) {
    toast.add({
      title: 'Failed to clear',
      color: 'error'
    })
  } finally {
    deletingCredential.value = null
  }
}

function viewWebhookGuide() {
  alert('View Webhook Guide - Coming Soon!')
}

function viewWebhookLogs() {
  alert('View Webhook Logs - Coming Soon!')
}

function testWebhook() {
  alert('Test Webhook - Coming Soon!')
}

definePageMeta({
  title: 'Webhook Configuration',
  description: 'Configure your webhook to receive TradingView alerts'
})
</script>

