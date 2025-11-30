import { defineEventHandler, createError } from 'h3'
import { useServiceSupabaseClient } from '~/utils/supabase'
import { serverSupabaseClient } from '#supabase/server'

/**
 * Get usage statistics for the authenticated user
 * GET /api/account/usage
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
    // Get user's subscription plan
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', userId)
      .maybeSingle()

    const plan = subscription?.plan || 'Free'

    // Define limits based on plan
    const limits = {
      exchanges: plan === 'Pro' ? Infinity : plan === 'Premium' ? 5 : plan === 'Basic' ? 3 : 1,
      strategies: plan === 'Free' ? 2 : Infinity,
      webhooks: plan === 'Pro' ? Infinity : plan === 'Premium' ? 5000 : plan === 'Basic' ? 1000 : 5
    }

    // Count exchanges (from bot_credentials where user has saved credentials)
    const { count: exchangesCount } = await supabase
      .from('bot_credentials')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('environment', 'production')
      .neq('exchange', 'webhook') // Exclude webhook credentials

    // Count active strategies
    const { count: strategiesCount } = await supabase
      .from('strategies')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active')

    // Count webhooks this month (where status != 'rate_limited')
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: webhooksCount } = await supabase
      .from('webhook_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())
      .neq('status', 'rate_limited')

    return {
      usage: {
        exchangesUsed: exchangesCount || 0,
        exchangesLimit: limits.exchanges,
        strategiesUsed: strategiesCount || 0,
        strategiesLimit: limits.strategies,
        webhooksUsed: webhooksCount || 0,
        webhooksLimit: limits.webhooks
      }
    }
  } catch (error: any) {
    console.error('Error fetching usage:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch usage statistics',
      data: error.message
    })
  }
})

