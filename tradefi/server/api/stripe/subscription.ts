import { defineEventHandler, getMethod, readBody, getQuery, createError } from 'h3'
import Stripe from 'stripe'
import { useServiceSupabaseClient } from '~/utils/supabase'
import { serverSupabaseClient } from '#supabase/server'

/**
 * Manage user subscription
 * GET: Get current subscription
 * POST: Update subscription (cancel, resume, change plan)
 * DELETE: Cancel subscription immediately
 */
export default defineEventHandler(async (event) => {
  try {
    const method = getMethod(event)
    const config = useRuntimeConfig()
    const supabase = useServiceSupabaseClient()

    // Validate Stripe is configured
    if (!config.stripeSecretKey) {
      console.error('[Stripe Subscription] Stripe secret key not configured')
      console.error('[Stripe Subscription] Config keys:', Object.keys(config))
      throw createError({
        statusCode: 500,
        statusMessage: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables.',
        data: 'Missing STRIPE_SECRET_KEY'
      })
    }

    // Validate Stripe key format
    if (!config.stripeSecretKey.startsWith('sk_')) {
      console.error('[Stripe Subscription] Invalid Stripe secret key format')
      throw createError({
        statusCode: 500,
        statusMessage: 'Invalid Stripe secret key format. Key should start with "sk_test_" or "sk_live_"',
        data: 'Invalid key format'
      })
    }

    const stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: '2024-11-20.acacia'
    })

  // Get authenticated user
  const clientSupabase = await serverSupabaseClient(event)
  const { data: { session }, error: sessionError } = await clientSupabase.auth.getSession()
  
  if (sessionError || !session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const userId = session.user.id || (session.user as any).sub

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user ID'
    })
  }

  switch (method) {
    case 'GET': {
      // Get user's subscription
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to fetch subscription',
          data: error.message
        })
      }

      // If no subscription, return Free plan
      if (!subscription) {
        return {
          subscription: {
            plan: 'Free',
            status: 'active',
            cost: '0.00'
          }
        }
      }

      // Fetch payment method from Stripe if customer exists
      let paymentMethod = null
      if (subscription.stripe_customer_id) {
        try {
          const customer = await stripe.customers.retrieve(subscription.stripe_customer_id)
          if (customer && !customer.deleted && typeof customer === 'object' && 'invoice_settings' in customer) {
            // Try to get default payment method from customer's invoice settings
            const defaultPaymentMethodId = (customer as Stripe.Customer).invoice_settings?.default_payment_method
            
            if (defaultPaymentMethodId && typeof defaultPaymentMethodId === 'string') {
              const pm = await stripe.paymentMethods.retrieve(defaultPaymentMethodId)
              if (pm && pm.card) {
                paymentMethod = {
                  brand: pm.card.brand || 'card',
                  last4: pm.card.last4 || '****',
                  exp_month: pm.card.exp_month,
                  exp_year: pm.card.exp_year
                }
              }
            } else if (subscription.stripe_subscription_id) {
              // Fallback: Get payment method from subscription
              try {
                const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id)
                const defaultPaymentMethodId = stripeSubscription.default_payment_method
                
                if (defaultPaymentMethodId && typeof defaultPaymentMethodId === 'string') {
                  const pm = await stripe.paymentMethods.retrieve(defaultPaymentMethodId)
                  if (pm && pm.card) {
                    paymentMethod = {
                      brand: pm.card.brand || 'card',
                      last4: pm.card.last4 || '****',
                      exp_month: pm.card.exp_month,
                      exp_year: pm.card.exp_year
                    }
                  }
                }
              } catch (subError) {
                // Subscription might not exist yet, ignore
                console.error('Error fetching payment method from subscription:', subError)
              }
            }
          }
        } catch (stripeError: any) {
          console.error('Error fetching payment method:', stripeError?.message || stripeError)
          // Don't fail if payment method fetch fails - it's optional
        }
      }

      return {
        subscription: {
          ...subscription,
          paymentMethod
        }
      }
    }

    case 'POST': {
      // Update subscription (cancel, resume, change plan)
      const body = await readBody<{ action: string; plan?: string }>(event)
      const { action, plan } = body

      // Get current subscription
      const { data: currentSub, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (subError) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to fetch subscription',
          data: subError.message
        })
      }

      if (!currentSub?.stripe_subscription_id) {
        throw createError({
          statusCode: 400,
          statusMessage: 'No active Stripe subscription found'
        })
      }

      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          currentSub.stripe_subscription_id
        )

        if (action === 'cancel') {
          // Cancel at period end
          await stripe.subscriptions.update(stripeSubscription.id, {
            cancel_at_period_end: true
          })

          await supabase
            .from('subscriptions')
            .update({
              cancel_at_period_end: true,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)

          return { success: true, message: 'Subscription will be canceled at the end of the billing period' }
        }

        if (action === 'resume') {
          // Resume subscription
          await stripe.subscriptions.update(stripeSubscription.id, {
            cancel_at_period_end: false
          })

          await supabase
            .from('subscriptions')
            .update({
              cancel_at_period_end: false,
              canceled_at: null,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)

          return { success: true, message: 'Subscription resumed' }
        }

        if (action === 'change_plan' && plan) {
          // Change plan (upgrade/downgrade)
          // This requires updating the subscription item
          // For now, we'll create a new checkout session for plan changes
          throw createError({
            statusCode: 400,
            statusMessage: 'Plan changes require a new checkout session. Please use the change plan button.'
          })
        }

        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid action'
        })
      } catch (error: any) {
        if (error.statusCode) {
          throw error
        }
        console.error('Error updating subscription:', error)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to update subscription',
          data: error.message
        })
      }
    }

    case 'DELETE': {
      // Cancel subscription immediately
      const { data: currentSub, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (subError) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to fetch subscription',
          data: subError.message
        })
      }

      if (!currentSub?.stripe_subscription_id) {
        throw createError({
          statusCode: 400,
          statusMessage: 'No active Stripe subscription found'
        })
      }

      try {
        await stripe.subscriptions.cancel(currentSub.stripe_subscription_id)

        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        return { success: true, message: 'Subscription canceled immediately' }
      } catch (error: any) {
        console.error('Error canceling subscription:', error)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to cancel subscription',
          data: error.message
        })
      }
    }

    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
  }
  } catch (error: any) {
    console.error('[Stripe Subscription] Unhandled error:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
      data: error.message
    })
  }
})

