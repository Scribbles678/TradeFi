<template>
  <div class="space-y-8 p-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-semibold text-foreground">Subscription Management</h1>
      <p class="text-muted-foreground text-sm mt-1">Manage your plan and billing</p>
    </div>

    <!-- Current Plan -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-2">
          <Icon name="i-heroicons-credit-card" class="w-5 h-5 text-muted-foreground" />
          <CardTitle>Current Plan</CardTitle>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-2xl font-bold text-foreground">{{ subscription.plan || 'Pro' }}</p>
            <p class="text-sm text-muted-foreground mt-1">${{ subscription.cost || '39.00' }}/month</p>
          </div>
          <Badge :variant="subscription.status === 'active' ? 'success' : 'pending'" class="text-sm">
            {{ subscription.status === 'active' ? 'Active' : 'Inactive' }}
          </Badge>
        </div>
        <div class="space-y-2 pt-2 border-t border-border">
          <div class="flex items-center gap-2 text-sm">
            <Icon name="i-heroicons-check-circle" class="w-4 h-4 text-green-400" />
            <span class="text-foreground">Automate any TradingView strategy</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <Icon name="i-heroicons-check-circle" class="w-4 h-4 text-green-400" />
            <span class="text-foreground">Fast order execution</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <span v-if="subscription.plan === 'Pro'" class="text-green-400 text-base font-bold">∞</span>
            <Icon v-else name="i-heroicons-check-circle" class="w-4 h-4 text-green-400" />
            <span class="text-foreground">{{ subscription.plan === 'Pro' ? 'Unlimited Exchanges' : subscription.plan === 'Premium' ? '5 Exchanges' : subscription.plan === 'Basic' ? '3 Exchanges' : '1 Exchange' }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <span v-if="subscription.plan !== 'Free'" class="text-green-400 text-base font-bold">∞</span>
            <Icon v-else name="i-heroicons-check-circle" class="w-4 h-4 text-green-400" />
            <span class="text-foreground">{{ subscription.plan === 'Free' ? '2 Active Strategies' : 'Unlimited Strategies' }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <span v-if="subscription.plan === 'Pro'" class="text-green-400 text-base font-bold">∞</span>
            <Icon v-else name="i-heroicons-check-circle" class="w-4 h-4 text-green-400" />
            <span class="text-foreground">{{ subscription.plan === 'Pro' ? 'Unlimited Webhooks' : subscription.plan === 'Premium' ? '5000 webhook signals monthly' : subscription.plan === 'Basic' ? '1000 webhook signals monthly' : '5 webhook signals monthly' }}</span>
          </div>
          <div v-if="subscription.plan === 'Pro'" class="flex items-center gap-2 text-sm">
            <Icon name="i-heroicons-check-circle" class="w-4 h-4 text-green-400" />
            <span class="text-foreground">Crypto Trailing Stop Loss</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <Icon name="i-heroicons-check-circle" class="w-4 h-4 text-green-400" />
            <span class="text-foreground">{{ subscription.plan === 'Pro' || subscription.plan === 'Premium' ? 'Priority Support' : subscription.plan === 'Basic' ? 'Email Support' : 'Community Support' }}</span>
          </div>
          <div v-if="subscription.plan === 'Pro'" class="flex items-center gap-2 text-sm">
            <Icon name="i-heroicons-check-circle" class="w-4 h-4 text-green-400" />
            <span class="text-foreground">Advanced Analytics</span>
          </div>
          <div v-if="subscription.plan === 'Pro'" class="flex items-center gap-2 text-sm">
            <Icon name="i-heroicons-check-circle" class="w-4 h-4 text-green-400" />
            <span class="text-foreground">Development Requests</span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 pt-2 border-t border-border text-sm">
          <div>
            <p class="text-muted-foreground">Next billing:</p>
            <p class="font-semibold text-foreground">{{ subscription.nextBilling || 'Mar 15, 2024' }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Payment method:</p>
            <p class="font-semibold text-foreground">{{ subscription.paymentMethod || '•••• •••• •••• 4242' }}</p>
          </div>
        </div>
        <div class="flex gap-2 pt-2">
          <Button
            size="sm"
            class="flex-1"
            @click="manageSubscription"
          >
            <Icon name="i-heroicons-cog-6-tooth" class="w-4 h-4 mr-1" />
            Manage Subscription
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="viewInvoices"
          >
            <Icon name="i-heroicons-document-text" class="w-4 h-4 mr-1" />
            View Invoices
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Upgrade/Downgrade -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-2">
          <Icon name="i-heroicons-arrows-up-down" class="w-5 h-5 text-muted-foreground" />
          <CardTitle>Change Plan</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <!-- Three Paid Plans -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <!-- Basic Plan -->
          <Card :class="subscription.plan === 'Basic' ? 'border-2 border-primary' : ''">
            <CardContent class="space-y-4 p-6">
              <div>
                <p class="text-2xl font-bold text-foreground">Basic</p>
                <p class="text-xs text-muted-foreground mt-1">Best for strategies that trade several times per week or month but not every day</p>
              </div>
              <div>
                <p class="text-4xl font-bold text-foreground">$19</p>
                <p class="text-sm text-muted-foreground">per month</p>
              </div>
              <div class="space-y-2 text-sm pt-4">
                <div class="flex items-center gap-2">
                  <Icon name="i-heroicons-check" class="w-4 h-4 text-green-400" />
                  <span class="text-foreground">Automate any TradingView strategy</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="i-heroicons-check" class="w-4 h-4 text-green-400" />
                  <span class="text-foreground">Fast order execution</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="i-heroicons-check" class="w-4 h-4 text-green-400" />
                  <span class="text-foreground">3 Exchanges</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-400 text-lg font-bold">∞</span>
                  <span class="text-foreground">Unlimited Strategies</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="i-heroicons-check" class="w-4 h-4 text-green-400" />
                  <span class="text-foreground">1000 webhook signals monthly</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="i-heroicons-check" class="w-4 h-4 text-green-400" />
                  <span class="text-foreground">Email Support</span>
                </div>
              </div>
              <Button
                v-if="subscription.plan !== 'Basic'"
                :variant="subscription.plan === 'Free' ? 'default' : 'outline'"
                size="sm"
                class="w-full mt-4"
                :disabled="loading"
                @click="changePlan('Basic')"
              >
                <Icon v-if="loading" name="i-heroicons-arrow-path" class="w-4 h-4 mr-1 animate-spin" />
                {{ subscription.plan === 'Free' ? 'Subscribe' : subscription.plan === 'Premium' || subscription.plan === 'Pro' ? 'Downgrade' : 'Select' }}
              </Button>
              <Button
                v-else
                size="sm"
                disabled
                class="w-full mt-4"
              >
                Current Plan
              </Button>
            </CardContent>
          </Card>

          <!-- Premium Plan (Highlighted) -->
          <Card :class="subscription.plan === 'Premium' ? 'border-2 border-primary' : ''" class="bg-primary text-primary-foreground border-primary/50">
            <CardContent class="space-y-4 p-6">
              <div>
                <p class="text-2xl font-bold text-primary-foreground">Premium</p>
                <p class="text-xs text-primary-foreground/80 mt-1">Designed for strategies that trade several times per day</p>
              </div>
              <div>
                <p class="text-4xl font-bold text-primary-foreground">$39</p>
                <p class="text-sm text-primary-foreground/80">per month</p>
              </div>
              <div class="space-y-2 text-sm pt-4">
                <div class="flex items-center gap-2">
                  <Icon name="i-heroicons-check" class="w-4 h-4 text-primary-foreground" />
                  <span class="text-primary-foreground">Automate any TradingView strategy</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="i-heroicons-check" class="w-4 h-4 text-primary-foreground" />
                  <span class="text-primary-foreground">Fast order execution</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="i-heroicons-check" class="w-4 h-4 text-primary-foreground" />
                  <span class="text-primary-foreground">5 Exchanges</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-primary-foreground text-lg font-bold">∞</span>
                  <span class="text-primary-foreground">Unlimited Strategies</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="i-heroicons-check" class="w-4 h-4 text-primary-foreground" />
                  <span class="text-primary-foreground">5000 webhook signals monthly</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="i-heroicons-check" class="w-4 h-4 text-primary-foreground" />
                  <span class="text-primary-foreground">Priority Support</span>
                </div>
              </div>
              <Button
                v-if="subscription.plan !== 'Premium'"
                size="sm"
                class="w-full mt-4 bg-background text-foreground hover:bg-background/90 border border-border"
                :disabled="loading"
                @click="changePlan('Premium')"
              >
                <Icon v-if="loading" name="i-heroicons-arrow-path" class="w-4 h-4 mr-1 animate-spin" />
                {{ subscription.plan === 'Free' || subscription.plan === 'Basic' ? 'Subscribe' : 'Downgrade' }}
              </Button>
              <Button
                v-else
                size="sm"
                disabled
                class="w-full mt-4 bg-background/50 text-foreground"
              >
                Current Plan
              </Button>
            </CardContent>
          </Card>

          <!-- Pro Plan -->
          <Card :class="subscription.plan === 'Pro' ? 'border-2 border-primary' : ''">
            <CardContent class="space-y-4 p-6">
              <div>
                <p class="text-2xl font-bold text-foreground">Pro</p>
                <p class="text-xs text-muted-foreground mt-1">Best for higher frequency trading strategies</p>
              </div>
              <div>
                <p class="text-4xl font-bold text-foreground">$59</p>
                <p class="text-sm text-muted-foreground">per month</p>
              </div>
              <div class="space-y-2 text-sm pt-4">
                <div class="flex items-center gap-2">
                  <Icon name="i-heroicons-check" class="w-4 h-4 text-green-400" />
                  <span class="text-foreground">Automate any TradingView strategy</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="i-heroicons-check" class="w-4 h-4 text-green-400" />
                  <span class="text-foreground">Fast order execution</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="i-heroicons-check" class="w-4 h-4 text-green-400" />
                  <span class="text-foreground">Crypto Trailing Stop Loss</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-400 text-lg font-bold">∞</span>
                  <span class="text-foreground">Unlimited Exchanges</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-400 text-lg font-bold">∞</span>
                  <span class="text-foreground">Unlimited Strategies</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-400 text-lg font-bold">∞</span>
                  <span class="text-foreground">Unlimited Webhooks</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="i-heroicons-check" class="w-4 h-4 text-green-400" />
                  <span class="text-foreground">Priority Support</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="i-heroicons-check" class="w-4 h-4 text-green-400" />
                  <span class="text-foreground">Advanced Analytics</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="i-heroicons-check" class="w-4 h-4 text-green-400" />
                  <span class="text-foreground">Development Requests</span>
                </div>
              </div>
              <Button
                v-if="subscription.plan !== 'Pro'"
                size="sm"
                class="w-full mt-4"
                :disabled="loading"
                @click="changePlan('Pro')"
              >
                <Icon v-if="loading" name="i-heroicons-arrow-path" class="w-4 h-4 mr-1 animate-spin" />
                {{ subscription.plan === 'Free' || subscription.plan === 'Basic' || subscription.plan === 'Premium' ? 'Upgrade' : 'Select' }}
              </Button>
              <Button
                v-else
                size="sm"
                disabled
                class="w-full mt-4"
              >
                Current Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        <!-- Free Tier (Below) -->
        <div class="text-center pt-6 border-t border-border">
          <p class="text-sm text-muted-foreground">
            Not ready for a paid account? 
            <button
              v-if="subscription.plan !== 'Free'"
              class="underline text-foreground hover:text-primary transition-colors"
              @click="changePlan('Free')"
            >
              Try Sparky for Free
            </button>
            <span v-else class="text-foreground font-semibold">Try TradeFI for Free</span>
            <span class="text-muted-foreground"> (up to 5 signals/month, 1 exchange)</span>
          </p>
          <div v-if="subscription.plan === 'Free'" class="mt-4 max-w-md mx-auto">
            <Card>
              <CardContent class="space-y-3 p-4">
                <div>
                  <p class="text-xl font-bold text-foreground">Free</p>
                  <p class="text-2xl font-bold mt-1 text-foreground">$0<span class="text-sm font-normal">/mo</span></p>
                </div>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center gap-2">
                    <Icon name="i-heroicons-check" class="w-4 h-4 text-green-400" />
                    <span class="text-foreground">1 Exchange</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Icon name="i-heroicons-check" class="w-4 h-4 text-green-400" />
                    <span class="text-foreground">2 Active Strategies</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Icon name="i-heroicons-check" class="w-4 h-4 text-green-400" />
                    <span class="text-foreground">Automate any TradingView strategy</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Icon name="i-heroicons-check" class="w-4 h-4 text-green-400" />
                    <span class="text-foreground">Fast order execution</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Icon name="i-heroicons-check" class="w-4 h-4 text-green-400" />
                    <span class="text-foreground">5 webhook signals monthly</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Icon name="i-heroicons-check" class="w-4 h-4 text-green-400" />
                    <span class="text-foreground">Community Support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Billing History -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-2">
          <Icon name="i-heroicons-document-text" class="w-5 h-5 text-muted-foreground" />
          <CardTitle>Billing History</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border">
                <th class="text-left py-2 px-4 font-semibold text-foreground">Date</th>
                <th class="text-left py-2 px-4 font-semibold text-foreground">Plan</th>
                <th class="text-right py-2 px-4 font-semibold text-foreground">Amount</th>
                <th class="text-left py-2 px-4 font-semibold text-foreground">Status</th>
                <th class="text-right py-2 px-4 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="invoice in billingHistory" :key="invoice.id" class="border-b border-border">
                <td class="py-2 px-4 text-foreground">{{ invoice.date }}</td>
                <td class="py-2 px-4 text-foreground">{{ invoice.plan }}</td>
                <td class="py-2 px-4 text-right font-semibold text-foreground">${{ invoice.amount }}</td>
                <td class="py-2 px-4">
                  <Badge :variant="invoice.status === 'paid' ? 'success' : 'pending'" class="text-xs">
                    {{ invoice.status === 'paid' ? 'Paid' : 'Pending' }}
                  </Badge>
                </td>
                <td class="py-2 px-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="downloadInvoice(invoice.id)"
                  >
                    <Icon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
      <CardFooter>
        <div class="flex justify-end w-full">
          <Button
            variant="ghost"
            size="sm"
            @click="viewAllInvoices"
          >
            View All Invoices
          </Button>
        </div>
      </CardFooter>
    </Card>
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
  stripe_customer_id?: string
  stripe_subscription_id?: string
  current_period_end?: string
  cancel_at_period_end?: boolean
}

interface BillingInvoice {
  id: string
  date: string
  plan: string
  amount: string
  status: 'paid' | 'pending'
}

const toast = useToast()
const loading = ref(false)
const subscription = ref<Subscription>({
  plan: 'Free',
  status: 'active',
  cost: '0.00',
  nextBilling: '—',
  paymentMethod: undefined
})

const billingHistory = ref<BillingInvoice[]>([])

// Plan pricing map
const planPricing: Record<string, string> = {
  'Free': '0.00',
  'Basic': '19.00',
  'Premium': '39.00',
  'Pro': '59.00'
}

// Load subscription from database
async function loadSubscription() {
  loading.value = true
  try {
    const response = await $fetch<{ subscription: Subscription }>('/api/stripe/subscription')
    
    if (response.subscription) {
      const sub = response.subscription
      subscription.value = {
        plan: sub.plan || 'Free',
        status: sub.status || 'active',
        cost: planPricing[sub.plan || 'Free'] || '0.00',
        nextBilling: sub.current_period_end 
          ? new Date(sub.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : '—',
        paymentMethod: '•••• •••• •••• 4242', // TODO: Get from Stripe
        stripe_customer_id: sub.stripe_customer_id,
        stripe_subscription_id: sub.stripe_subscription_id,
        current_period_end: sub.current_period_end,
        cancel_at_period_end: sub.cancel_at_period_end
      }
    }
  } catch (error: any) {
    console.error('Failed to load subscription:', error)
    // Default to Free plan if error
    subscription.value = {
      plan: 'Free',
      status: 'active',
      cost: '0.00',
      nextBilling: '—'
    }
  } finally {
    loading.value = false
  }
}

// Create checkout session and redirect to Stripe
async function changePlan(plan: string) {
  if (plan === 'Free') {
    // Downgrade to Free - cancel subscription
    if (!confirm(`Are you sure you want to cancel your subscription and downgrade to Free?`)) {
      return
    }
    
    try {
      await $fetch('/api/stripe/subscription', {
        method: 'DELETE'
      })
      
      toast.add({
        title: 'Subscription canceled',
        description: 'Your subscription has been canceled. You now have Free plan access.',
        color: 'success',
        icon: 'i-heroicons-check-circle'
      })
      
      await loadSubscription()
    } catch (error: any) {
      toast.add({
        title: 'Failed to cancel subscription',
        description: error?.data || error?.message || 'An error occurred',
        color: 'error'
      })
    }
    return
  }

  if (plan === subscription.value.plan) {
    return // Already on this plan
  }

  loading.value = true
  try {
    const response = await $fetch<{ url: string }>('/api/stripe/create-checkout', {
      method: 'POST',
      body: { plan }
    })

    if (response.url) {
      // Redirect to Stripe Checkout
      window.location.href = response.url
    }
  } catch (error: any) {
    console.error('Failed to create checkout session:', error)
    toast.add({
      title: 'Failed to start checkout',
      description: error?.data || error?.message || 'An error occurred while creating the checkout session.',
      color: 'error'
    })
    loading.value = false
  }
}

async function manageSubscription() {
  // Open Stripe Customer Portal
  // TODO: Implement Stripe Customer Portal
  toast.add({
    title: 'Manage Subscription',
    description: 'Stripe Customer Portal coming soon!',
    color: 'info'
  })
}

function viewInvoices() {
  // TODO: Fetch invoices from Stripe
  toast.add({
    title: 'View Invoices',
    description: 'Invoice management coming soon!',
    color: 'info'
  })
}

function downloadInvoice(invoiceId: string) {
  // TODO: Download invoice from Stripe
  toast.add({
    title: 'Download Invoice',
    description: `Invoice ${invoiceId} download coming soon!`,
    color: 'info'
  })
}

function viewAllInvoices() {
  viewInvoices()
}

// Handle success/cancel redirects from Stripe
onMounted(async () => {
  const route = useRoute()
  
  // Check for success/cancel query params
  if (route.query.success === 'true') {
    toast.add({
      title: 'Payment successful!',
      description: 'Your subscription has been activated.',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })
    // Remove query params
    await navigateTo('/account/subscription', { replace: true })
    await loadSubscription()
  } else if (route.query.canceled === 'true') {
    toast.add({
      title: 'Checkout canceled',
      description: 'Your subscription was not changed.',
      color: 'warning'
    })
    // Remove query params
    await navigateTo('/account/subscription', { replace: true })
  } else {
    // Normal load
    await loadSubscription()
  }
})

definePageMeta({
  title: 'Subscription',
  description: 'Manage your plan and billing'
})
</script>

