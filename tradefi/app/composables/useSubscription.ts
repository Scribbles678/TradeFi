import { ref, computed, onMounted } from 'vue'
import { useSupabaseUser } from '#imports'

// Singleton state - shared across all components
const subscriptionState = ref<{
  plan: string
  status: string
  cost: string
  nextBilling: string
  paymentMethod: string | undefined
  current_period_end?: string
  cancel_at_period_end?: boolean
  stripe_customer_id?: string
  stripe_subscription_id?: string
  lastLoaded?: number
}>({
  plan: 'Free',
  status: 'active',
  cost: '0.00',
  nextBilling: '—',
  paymentMethod: undefined
})

// Plan pricing map
const planPricing: Record<string, string> = {
  'Free': '0.00',
  'Basic': '19.00',
  'Premium': '39.00',
  'Pro': '59.00'
}

// Cache duration: 30 seconds (subscription data doesn't change frequently)
const CACHE_DURATION = 30 * 1000

let isInitialized = false

export const useSubscription = () => {
  const user = useSupabaseUser()
  // Load subscription from API
  async function loadSubscription(force = false) {
    const now = Date.now()
    
    // Use cached data if it's fresh and not forcing a reload
    if (!force && subscriptionState.value.lastLoaded && (now - subscriptionState.value.lastLoaded) < CACHE_DURATION) {
      return subscriptionState.value
    }
    
    try {
      const response = await $fetch<{ 
        subscription: {
          plan: string
          status: string
          cost?: string
          nextBilling?: string
          paymentMethod?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          stripe_customer_id?: string
          stripe_subscription_id?: string
        }
      }>('/api/stripe/subscription')
      
      if (response?.subscription) {
        const sub = response.subscription
        subscriptionState.value = {
          plan: sub.plan || 'Free',
          status: sub.status || 'active',
          cost: sub.cost || planPricing[sub.plan || 'Free'] || '0.00',
          nextBilling: sub.nextBilling || (sub.current_period_end 
            ? new Date(sub.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '—'),
          paymentMethod: sub.paymentMethod || undefined,
          current_period_end: sub.current_period_end,
          cancel_at_period_end: sub.cancel_at_period_end,
          stripe_customer_id: sub.stripe_customer_id,
          stripe_subscription_id: sub.stripe_subscription_id,
          lastLoaded: now
        }
      }
    } catch (error) {
      console.error('Failed to load subscription:', error)
      // Keep existing state on error (don't reset to defaults)
      if (!subscriptionState.value.lastLoaded) {
        // Only set defaults if we've never loaded before
        subscriptionState.value = {
          plan: 'Free',
          status: 'active',
          cost: '0.00',
          nextBilling: '—',
          paymentMethod: undefined,
          lastLoaded: now
        }
      }
    }
    
    return subscriptionState.value
  }

  // Initialize on first use
  if (!isInitialized) {
    isInitialized = true
    if (user.value) {
      // Load subscription data on first use
      loadSubscription(false) // Use cache if available
    }
  }

  return {
    subscription: computed(() => subscriptionState.value),
    loadSubscription
  }
}

