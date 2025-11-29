import { defineEventHandler, readBody, createError } from 'h3'
import Stripe from 'stripe'
import { useServiceSupabaseClient } from '~/utils/supabase'
import { serverSupabaseClient } from '#supabase/server'

/**
 * Create Stripe Customer Portal session
 * POST /api/stripe/customer-portal
 * Body: { return_url: string }
 */
export default defineEventHandler(async (event) => {
  try {
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
      console.error('[Stripe Customer Portal] Stripe secret key not configured')
      throw createError({
        statusCode: 500,
        statusMessage: 'Stripe is not configured'
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

  // Get user's subscription to find Stripe customer ID
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (subError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch subscription',
      data: subError.message
    })
  }

  if (!subscription?.stripe_customer_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No active subscription found'
    })
  }

  const body = await readBody<{ return_url?: string }>(event)
  const returnUrl = body?.return_url || `${process.env.SITE_URL || 'http://localhost:3001'}/account/subscription`

  // Create Customer Portal session
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: returnUrl
  })

  return {
    url: portalSession.url
  }
  } catch (error: any) {
    console.error('[Stripe Customer Portal] Unhandled error:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
      data: error.message || 'Unknown error'
    })
  }
})

