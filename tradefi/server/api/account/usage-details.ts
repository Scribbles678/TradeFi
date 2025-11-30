import { defineEventHandler, createError } from 'h3'
import { useServiceSupabaseClient } from '~/utils/supabase'
import { serverSupabaseClient } from '#supabase/server'

/**
 * Get detailed usage information for the authenticated user
 * GET /api/account/usage-details
 * 
 * Returns:
 * - Connected exchanges with status
 * - All strategies with status
 * - Webhook counts per exchange for current month
 */
export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  
  if (method !== 'GET') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  const supabase = useServiceSupabaseClient()

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

  try {
    // 1. Get all connected exchanges (from bot_credentials)
    const { data: credentials, error: credError } = await supabase
      .from('bot_credentials')
      .select('exchange, last_tested, created_at')
      .eq('user_id', userId)
      .eq('environment', 'production')
      .neq('exchange', 'webhook') // Exclude webhook credentials

    if (credError) {
      console.error('[Usage Details API] Error fetching credentials:', credError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch exchanges'
      })
    }

    // 2. Get all strategies
    const { data: strategies, error: stratError } = await supabase
      .from('strategies')
      .select('id, name, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (stratError) {
      console.error('[Usage Details API] Error fetching strategies:', stratError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch strategies'
      })
    }

    // 3. Get webhook counts per exchange for current month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: webhooks, error: webhookError } = await supabase
      .from('webhook_requests')
      .select('exchange, status')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())
      .neq('status', 'rate_limited') // Don't count rate-limited webhooks

    if (webhookError) {
      console.error('[Usage Details API] Error fetching webhooks:', webhookError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch webhook data'
      })
    }

    // Process exchanges: determine if active (has last_tested within last 24 hours)
    const exchanges = (credentials || []).map(cred => {
      const isActive = cred.last_tested 
        ? (Date.now() - new Date(cred.last_tested).getTime()) < (24 * 60 * 60 * 1000)
        : false

      return {
        exchange: cred.exchange,
        isActive,
        lastTested: cred.last_tested || null,
        createdAt: cred.created_at
      }
    })

    // Process strategies: map to simple format
    const strategiesList = (strategies || []).map(strat => ({
      id: strat.id,
      name: strat.name,
      status: strat.status,
      isActive: strat.status === 'active',
      createdAt: strat.created_at
    }))

    // Process webhooks: count per exchange
    const webhookCountsByExchange: Record<string, number> = {}
    const totalWebhooks = webhooks?.length || 0

    if (webhooks) {
      webhooks.forEach(webhook => {
        const exchange = webhook.exchange || 'unknown'
        webhookCountsByExchange[exchange] = (webhookCountsByExchange[exchange] || 0) + 1
      })
    }

    // Add webhook counts to exchanges
    const exchangesWithWebhooks = exchanges.map(exchange => ({
      ...exchange,
      webhookCount: webhookCountsByExchange[exchange.exchange] || 0
    }))

    return {
      exchanges: exchangesWithWebhooks,
      strategies: strategiesList,
      totalWebhooks,
      webhookCountsByExchange
    }
  } catch (error: any) {
    console.error('[Usage Details API] Unhandled error:', error)
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

