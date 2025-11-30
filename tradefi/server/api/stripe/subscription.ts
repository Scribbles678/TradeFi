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

  // Plan pricing map
  const planPricing: Record<string, string> = {
    'Free': '0.00',
    'Basic': '19.00',
    'Premium': '39.00',
    'Pro': '59.00'
  }

  switch (method) {
    case 'GET': {
      // Get user's subscription from database
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

      // If subscription exists but has stripe_customer_id, try to sync from Stripe
      if (subscription?.stripe_customer_id) {
        try {
          // Get all active subscriptions for this customer from Stripe
          const stripeSubscriptions = await stripe.subscriptions.list({
            customer: subscription.stripe_customer_id,
            status: 'all', // Get all statuses
            limit: 10
          })

          // Find the most recent active subscription (or the one with latest current_period_end)
          const activeSubscriptions = stripeSubscriptions.data.filter(sub => 
            sub.status === 'active' || sub.status === 'trialing'
          )

          if (activeSubscriptions.length > 0) {
            // Sort by current_period_end (most recent first)
            activeSubscriptions.sort((a, b) => b.current_period_end - a.current_period_end)
            const latestSubscription = activeSubscriptions[0]

            // Get plan from metadata or price
            let plan = latestSubscription.metadata?.plan || 'Free'
            
            // If no plan in metadata, try to infer from price
            if (plan === 'Free' && latestSubscription.items.data.length > 0) {
              const priceId = latestSubscription.items.data[0].price.id
              // Check if price ID matches our known plans
              const priceIdBasic = process.env.STRIPE_PRICE_ID_BASIC
              const priceIdPremium = process.env.STRIPE_PRICE_ID_PREMIUM
              const priceIdPro = process.env.STRIPE_PRICE_ID_PRO
              
              if (priceId === priceIdBasic) plan = 'Basic'
              else if (priceId === priceIdPremium) plan = 'Premium'
              else if (priceId === priceIdPro) plan = 'Pro'
            }

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
            const status = statusMap[latestSubscription.status] || 'active'

            // Update database with latest Stripe data
            await supabase
              .from('subscriptions')
              .upsert({
                user_id: userId,
                plan: plan,
                status: status,
                stripe_subscription_id: latestSubscription.id,
                stripe_customer_id: subscription.stripe_customer_id,
                stripe_price_id: latestSubscription.items.data[0]?.price.id,
                current_period_start: new Date(latestSubscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(latestSubscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: latestSubscription.cancel_at_period_end,
                canceled_at: latestSubscription.canceled_at ? new Date(latestSubscription.canceled_at * 1000).toISOString() : null,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'user_id'
              })

            // Use the synced data
            const syncedSubscription = {
              ...subscription,
              plan: plan,
              status: status,
              stripe_subscription_id: latestSubscription.id,
              current_period_start: new Date(latestSubscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(latestSubscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: latestSubscription.cancel_at_period_end
            }

            // Fetch payment method
            let paymentMethod = null
            try {
              const customer = await stripe.customers.retrieve(subscription.stripe_customer_id)
              if (customer && !customer.deleted && typeof customer === 'object' && 'invoice_settings' in customer) {
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
                } else if (latestSubscription.default_payment_method) {
                  const pm = await stripe.paymentMethods.retrieve(latestSubscription.default_payment_method as string)
                  if (pm && pm.card) {
                    paymentMethod = {
                      brand: pm.card.brand || 'card',
                      last4: pm.card.last4 || '****',
                      exp_month: pm.card.exp_month,
                      exp_year: pm.card.exp_year
                    }
                  }
                }
              }
            } catch (stripeError: any) {
              console.error('Error fetching payment method:', stripeError?.message || stripeError)
            }

            // Format payment method string
            let paymentMethodString: string | undefined = undefined
            if (paymentMethod && paymentMethod.last4) {
              const brand = paymentMethod.brand ? paymentMethod.brand.charAt(0).toUpperCase() + paymentMethod.brand.slice(1) : 'Card'
              const exp = paymentMethod.exp_month && paymentMethod.exp_year 
                ? ` ${paymentMethod.exp_month}/${paymentMethod.exp_year.toString().slice(-2)}` 
                : ''
              paymentMethodString = `${brand} •••• ${paymentMethod.last4}${exp}`
            }

            return {
              subscription: {
                plan: syncedSubscription.plan,
                status: syncedSubscription.status,
                cost: planPricing[syncedSubscription.plan] || '0.00',
                nextBilling: syncedSubscription.current_period_end 
                  ? new Date(syncedSubscription.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—',
                paymentMethod: paymentMethodString,
                current_period_end: syncedSubscription.current_period_end,
                cancel_at_period_end: syncedSubscription.cancel_at_period_end
              }
            }
          }
        } catch (stripeError: any) {
          console.error('Error syncing subscription from Stripe:', stripeError)
          // Continue with database subscription if Stripe sync fails
        }
      }

      // If no subscription in database, try to find customer in Stripe
      if (!subscription) {
        try {
          // Search for customer by email
          const clientSupabase = await serverSupabaseClient(event)
          const { data: { session } } = await clientSupabase.auth.getSession()
          const userEmail = session?.user?.email

          if (userEmail) {
            const customers = await stripe.customers.list({
              email: userEmail,
              limit: 1
            })

            if (customers.data.length > 0) {
              const customer = customers.data[0]
              
              // Get subscriptions for this customer
              const stripeSubscriptions = await stripe.subscriptions.list({
                customer: customer.id,
                status: 'all',
                limit: 10
              })

              // Find active subscription
              const activeSubscriptions = stripeSubscriptions.data.filter(sub => 
                sub.status === 'active' || sub.status === 'trialing'
              )

              if (activeSubscriptions.length > 0) {
                activeSubscriptions.sort((a, b) => b.current_period_end - a.current_period_end)
                const latestSubscription = activeSubscriptions[0]

                // Get plan from metadata or price
                let plan = latestSubscription.metadata?.plan || 'Free'
                
                if (plan === 'Free' && latestSubscription.items.data.length > 0) {
                  const priceId = latestSubscription.items.data[0].price.id
                  const priceIdBasic = process.env.STRIPE_PRICE_ID_BASIC
                  const priceIdPremium = process.env.STRIPE_PRICE_ID_PREMIUM
                  const priceIdPro = process.env.STRIPE_PRICE_ID_PRO
                  
                  if (priceId === priceIdBasic) plan = 'Basic'
                  else if (priceId === priceIdPremium) plan = 'Premium'
                  else if (priceId === priceIdPro) plan = 'Pro'
                }

                const statusMap: Record<string, string> = {
                  'active': 'active',
                  'canceled': 'canceled',
                  'past_due': 'past_due',
                  'trialing': 'trialing',
                  'incomplete': 'incomplete',
                  'incomplete_expired': 'canceled',
                  'unpaid': 'past_due'
                }
                const status = statusMap[latestSubscription.status] || 'active'

                // Create subscription record in database
                await supabase
                  .from('subscriptions')
                  .upsert({
                    user_id: userId,
                    plan: plan,
                    status: status,
                    stripe_subscription_id: latestSubscription.id,
                    stripe_customer_id: customer.id,
                    stripe_price_id: latestSubscription.items.data[0]?.price.id,
                    current_period_start: new Date(latestSubscription.current_period_start * 1000).toISOString(),
                    current_period_end: new Date(latestSubscription.current_period_end * 1000).toISOString(),
                    cancel_at_period_end: latestSubscription.cancel_at_period_end,
                    canceled_at: latestSubscription.canceled_at ? new Date(latestSubscription.canceled_at * 1000).toISOString() : null,
                    updated_at: new Date().toISOString()
                  }, {
                    onConflict: 'user_id'
                  })

                // Fetch payment method
                let paymentMethod = null
                try {
                  const defaultPaymentMethodId = latestSubscription.default_payment_method
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
                } catch (pmError) {
                  console.error('Error fetching payment method:', pmError)
                }

                return {
                  subscription: {
                    plan: plan,
                    status: status,
                    cost: planPricing[plan] || '0.00',
                    nextBilling: new Date(latestSubscription.current_period_end * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    paymentMethod,
                    current_period_end: new Date(latestSubscription.current_period_end * 1000).toISOString(),
                    cancel_at_period_end: latestSubscription.cancel_at_period_end
                  }
                }
              }
            }
          }
        } catch (stripeError: any) {
          console.error('Error syncing subscription from Stripe:', stripeError)
          // Fall through to return Free plan
        }

        // If still no subscription found, return Free plan
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

      // Format subscription response
      const plan = subscription.plan || 'Free'
      const status = subscription.status || 'active'
      
      // Format payment method string
      let paymentMethodString: string | undefined = undefined
      if (paymentMethod && paymentMethod.last4) {
        const brand = paymentMethod.brand ? paymentMethod.brand.charAt(0).toUpperCase() + paymentMethod.brand.slice(1) : 'Card'
        const exp = paymentMethod.exp_month && paymentMethod.exp_year 
          ? ` ${paymentMethod.exp_month}/${paymentMethod.exp_year.toString().slice(-2)}` 
          : ''
        paymentMethodString = `${brand} •••• ${paymentMethod.last4}${exp}`
      }
      
      return {
        subscription: {
          plan: plan,
          status: status,
          cost: planPricing[plan] || '0.00',
          nextBilling: subscription.current_period_end 
            ? new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '—',
          paymentMethod: paymentMethodString,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end
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

