import { defineEventHandler, readBody, createError } from 'h3'
import Stripe from 'stripe'
import { useServiceSupabaseClient } from '~/utils/supabase'
import { serverSupabaseClient } from '#supabase/server'

/**
 * Create a Stripe Checkout Session for subscription
 * POST /api/stripe/create-checkout
 * Body: { plan: 'Basic' | 'Premium' | 'Pro' }
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
  if (!config.stripeSecretKey) {
    console.error('[Stripe Create Checkout] Stripe secret key not configured')
    throw createError({
      statusCode: 500,
      statusMessage: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables.',
      data: 'Missing STRIPE_SECRET_KEY'
    })
  }

  // Validate Stripe key format
  if (!config.stripeSecretKey.startsWith('sk_')) {
    console.error('[Stripe Create Checkout] Invalid Stripe secret key format')
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
  const userEmail = session.user.email

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user ID'
    })
  }

  try {
    const body = await readBody<{ plan: string }>(event)
    const { plan } = body

    if (!plan || !['Basic', 'Premium', 'Pro'].includes(plan)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid plan. Must be Basic, Premium, or Pro'
      })
    }

    // Map plan to price amount (in cents)
    const planPricing: Record<string, number> = {
      'Basic': 1900,    // $19.00
      'Premium': 3900,  // $39.00
      'Pro': 5900       // $59.00
    }

    const amount = planPricing[plan]

    if (!amount) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid plan: ${plan}`
      })
    }

    // Option 1: Use Price IDs from env (recommended for production)
    // This allows different Price IDs for test/live mode
    const priceIdFromEnv = process.env[`STRIPE_PRICE_ID_${plan.toUpperCase()}`]
    
    // Validate Price ID format (should start with 'price_')
    let priceId = priceIdFromEnv
    if (priceIdFromEnv && !priceIdFromEnv.startsWith('price_')) {
      console.warn(`[Stripe Create Checkout] STRIPE_PRICE_ID_${plan.toUpperCase()} appears to be a Product ID (${priceIdFromEnv}), not a Price ID. Looking up price...`)
      // If it's a product ID, try to find the price
      try {
        const prices = await stripe.prices.list({
          product: priceIdFromEnv,
          active: true,
          limit: 1
        })
        if (prices.data.length > 0) {
          priceId = prices.data[0].id
          console.log(`[Stripe Create Checkout] Found price ${priceId} for product ${priceIdFromEnv}`)
        } else {
          priceId = null // Will trigger lookup by name
        }
      } catch (productError) {
        console.error(`[Stripe Create Checkout] Error looking up price for product ${priceIdFromEnv}:`, productError)
        priceId = null // Will trigger lookup by name
      }
    }

    // Option 2: Look up product by name/metadata (alternative approach)
    if (!priceId) {
      // Try to find product by name in Stripe
      try {
        const products = await stripe.products.list({
          limit: 100,
          active: true
        })

        const product = products.data.find(p => 
          p.name.toLowerCase() === plan.toLowerCase() ||
          p.metadata?.plan === plan
        )

        if (product) {
          // Get the first active price for this product
          const prices = await stripe.prices.list({
            product: product.id,
            active: true,
            limit: 1
          })

          if (prices.data.length > 0) {
            priceId = prices.data[0].id
          }
        }
      } catch (lookupError) {
        console.error('Error looking up Stripe product:', lookupError)
      }
    }

    // Option 3: Create price on-the-fly (not recommended, but possible)
    if (!priceId) {
      // Create product and price dynamically
      // Note: This creates a new product/price each time, which is not ideal
      // Better to create them in Stripe Dashboard first
      try {
        const product = await stripe.products.create({
          name: `${plan} Plan`,
          metadata: { plan }
        })

        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: amount,
          currency: 'usd',
          recurring: {
            interval: 'month'
          },
          metadata: { plan }
        })

        priceId = price.id
      } catch (createError) {
        console.error('Error creating Stripe product/price:', createError)
        throw createError({
          statusCode: 500,
          statusMessage: `Failed to create or find Stripe price for ${plan} plan. Please create the product in Stripe Dashboard or set STRIPE_PRICE_ID_${plan.toUpperCase()} environment variable.`
        })
      }
    }

    // Get or create Stripe customer
    let stripeCustomerId: string | null = null

    // Check if user already has a Stripe customer ID
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (existingSubscription?.stripe_customer_id) {
      stripeCustomerId = existingSubscription.stripe_customer_id
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail || undefined,
        metadata: {
          user_id: userId
        }
      })
      stripeCustomerId = customer.id

      // Save customer ID to database (create or update subscription)
      await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan: 'Free', // Default until payment succeeds
          status: 'incomplete',
          stripe_customer_id: stripeCustomerId
        }, {
          onConflict: 'user_id'
        })
    }

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${process.env.SITE_URL || 'http://localhost:3001'}/account/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL || 'http://localhost:3001'}/account/subscription?canceled=true`,
      metadata: {
        user_id: userId,
        plan: plan
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          plan: plan
        }
      }
    })

    return {
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    }
  } catch (error: any) {
    console.error('[Stripe Create Checkout] Error:', error)
    if (error.statusCode) {
      throw error
    }
    console.error('Error creating checkout session:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create checkout session',
      data: error.message || 'Unknown error'
    })
  }
})

