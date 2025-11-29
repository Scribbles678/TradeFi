import { defineEventHandler, getQuery, createError } from 'h3'
import Stripe from 'stripe'
import { useServiceSupabaseClient } from '~/utils/supabase'
import { serverSupabaseClient } from '#supabase/server'

/**
 * Get invoice PDF download URL
 * GET /api/stripe/invoice-download?invoice_id=in_xxx
 */
export default defineEventHandler(async (event) => {
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

  // Get user's subscription to verify access
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

  const query = getQuery(event)
  const invoiceId = query.invoice_id as string

  if (!invoiceId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing invoice_id parameter'
    })
  }

  try {
    // Retrieve invoice and verify it belongs to the user
    const invoice = await stripe.invoices.retrieve(invoiceId)

    if (subscription?.stripe_customer_id && invoice.customer !== subscription.stripe_customer_id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied to this invoice'
      })
    }

    if (!invoice.invoice_pdf) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Invoice PDF not available'
      })
    }

    return {
      url: invoice.invoice_pdf,
      hosted_invoice_url: invoice.hosted_invoice_url
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error fetching invoice:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch invoice',
      data: error.message
    })
  }
})

