import { defineEventHandler, readRawBody, createError, getHeader } from 'h3'
import Stripe from 'stripe'
import { useServiceSupabaseClient } from '~/utils/supabase'

/**
 * Stripe Webhook Handler
 * Handles subscription events from Stripe
 * POST /api/stripe/webhook
 */
export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  
  if (method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  const config = useRuntimeConfig()
  const supabase = useServiceSupabaseClient()

  // Validate Stripe is configured
  if (!config.stripeSecretKey || !config.stripeWebhookSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Stripe webhook is not configured'
    })
  }

  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2024-11-20.acacia'
  })

  const signature = getHeader(event, 'stripe-signature')
  
  if (!signature) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing stripe-signature header'
    })
  }

  // Read raw body as string for signature verification
  // Stripe requires the raw body, not parsed JSON
  const body = await readRawBody(event, 'utf8')

  if (!body) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing request body'
    })
  }

  let stripeEvent: Stripe.Event

  try {
    // Verify webhook signature
    stripeEvent = stripe.webhooks.constructEvent(
      body as string,
      signature,
      config.stripeWebhookSecret
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    throw createError({
      statusCode: 400,
      statusMessage: `Webhook Error: ${err.message}`
    })
  }

  try {
    // Handle the event
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )
          
          await handleSubscriptionUpdate(subscription, supabase)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = stripeEvent.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription, supabase)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object as Stripe.Subscription
        await handleSubscriptionCancellation(subscription, supabase)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = stripeEvent.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )
          await handleSubscriptionUpdate(subscription, supabase)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )
          await handleSubscriptionUpdate(subscription, supabase, 'past_due')
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`)
    }

    return { received: true }
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Webhook processing failed',
      data: error.message
    })
  }
})

async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  supabase: any,
  statusOverride?: string
) {
  const userId = subscription.metadata?.user_id
  const plan = subscription.metadata?.plan || 'Free'

  if (!userId) {
    console.error('Subscription missing user_id in metadata')
    return
  }

  // Determine subscription status
  let status = statusOverride || subscription.status
  // Map Stripe status to our status
  const statusMap: Record<string, string> = {
    'active': 'active',
    'canceled': 'canceled',
    'past_due': 'past_due',
    'trialing': 'trialing',
    'incomplete': 'incomplete',
    'incomplete_expired': 'canceled',
    'unpaid': 'past_due'
  }
  status = statusMap[status] || 'active'

  // Update or create subscription in database
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      plan: plan,
      status: status,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      stripe_price_id: subscription.items.data[0]?.price.id,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      metadata: subscription.metadata,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })

  if (error) {
    console.error('Error updating subscription:', error)
    throw error
  }
}

async function handleSubscriptionCancellation(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.error('Subscription missing user_id in metadata')
    return
  }

  // Update subscription status to canceled
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  if (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

