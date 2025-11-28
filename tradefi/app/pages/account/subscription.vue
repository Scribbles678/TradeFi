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
                @click="changePlan('Basic')"
              >
                {{ subscription.plan === 'Free' ? 'Signup' : subscription.plan === 'Premium' || subscription.plan === 'Pro' ? 'Downgrade' : 'Select' }}
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
                @click="changePlan('Premium')"
              >
                {{ subscription.plan === 'Free' || subscription.plan === 'Basic' ? 'Signup' : 'Downgrade' }}
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
                @click="changePlan('Pro')"
              >
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
import { ref } from 'vue'

interface Subscription {
  plan: string
  status: string
  cost: string
  nextBilling: string
  paymentMethod?: string
}

interface BillingInvoice {
  id: string
  date: string
  plan: string
  amount: string
  status: 'paid' | 'pending'
}

const subscription = ref<Subscription>({
  plan: 'Premium',
  status: 'active',
  cost: '39.00',
  nextBilling: 'Mar 15, 2024',
  paymentMethod: '•••• •••• •••• 4242'
})

const billingHistory = ref<BillingInvoice[]>([
  { id: '1', date: 'Feb 15, 2024', plan: 'Pro', amount: '59.00', status: 'paid' },
  { id: '2', date: 'Jan 15, 2024', plan: 'Pro', amount: '59.00', status: 'paid' },
  { id: '3', date: 'Dec 15, 2023', plan: 'Basic', amount: '19.00', status: 'paid' }
])

function changePlan(plan: string) {
  if (!confirm(`Are you sure you want to change to the ${plan} plan?`)) {
    return
  }
  subscription.value.plan = plan
  if (plan === 'Free') {
    subscription.value.cost = '0.00'
  } else if (plan === 'Basic') {
    subscription.value.cost = '19.00'
  } else if (plan === 'Premium') {
    subscription.value.cost = '39.00'
  } else if (plan === 'Pro') {
    subscription.value.cost = '59.00'
  }
  alert(`Plan changed to ${plan} - Coming Soon! (This is a placeholder)`)
}

function manageSubscription() {
  alert('Manage Subscription - Coming Soon!')
}

function viewInvoices() {
  alert('View Invoices - Coming Soon!')
}

function downloadInvoice(invoiceId: string) {
  alert(`Download Invoice ${invoiceId} - Coming Soon!`)
}

function viewAllInvoices() {
  alert('View All Invoices - Coming Soon!')
}

definePageMeta({
  title: 'Subscription',
  description: 'Manage your plan and billing'
})
</script>

