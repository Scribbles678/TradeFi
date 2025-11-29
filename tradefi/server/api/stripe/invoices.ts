import { defineEventHandler, getQuery, createError } from 'h3'
import Stripe from 'stripe'
import { useServiceSupabaseClient } from '~/utils/supabase'
import { serverSupabaseClient } from '#supabase/server'

/**
 * Get invoices for the authenticated user
 * GET /api/stripe/invoices?limit=10
 */
export default defineEventHandler(async (event) => {
  try {
    const method = event.node.req.method
    
    if (method !== 'GET') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
    }

    const config = useRuntimeConfig()
    const supabase = useServiceSupabaseClient()

    // Validate Stripe is configured
    if (!config.stripeSecretKey) {
      console.error('[Stripe Invoices] Stripe secret key not configured')
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
    // No subscription, return empty array
    return { invoices: [] }
  }

  try {
    const query = getQuery(event)
  const limit = parseInt(query.limit as string) || 10

  try {
    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: subscription.stripe_customer_id,
      limit,
      expand: ['data.subscription']
    })

    // Format invoices for frontend
    const formattedInvoices = invoices.data.map((invoice) => {
      const subscription = invoice.subscription as Stripe.Subscription | null
      const planName = subscription?.metadata?.plan || 'Unknown'
      
      return {
        id: invoice.id,
        number: invoice.number,
        date: new Date(invoice.created * 1000).toISOString(),
        plan: planName,
        amount: (invoice.amount_paid / 100).toFixed(2),
        status: invoice.status === 'paid' ? 'paid' : invoice.status === 'open' ? 'pending' : 'failed',
        invoice_pdf: invoice.invoice_pdf,
        hosted_invoice_url: invoice.hosted_invoice_url
      }
    })

    return { invoices: formattedInvoices }
  } catch (error: any) {
    console.error('[Stripe Invoices] Error:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch invoices',
      data: error.message || 'Unknown error'
    })
  }
  } catch (error: any) {
    console.error('[Stripe Invoices] Unhandled error:', error)
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

