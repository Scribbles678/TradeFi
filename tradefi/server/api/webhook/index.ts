import { defineEventHandler, readBody, createError } from 'h3'
import { useServiceSupabaseClient } from '~/utils/supabase'
import { serverSupabaseClient } from '#supabase/server'

interface WebhookPayload {
  secret: string
  exchange?: string
  action?: string
  symbol?: string
  [key: string]: any
}

/**
 * Webhook endpoint that receives TradingView alerts
 * 
 * Flow:
 * 1. Receives webhook payload with secret
 * 2. Looks up user by webhook secret
 * 3. Checks subscription limits
 * 4. Logs the webhook request
 * 5. Processes the webhook (or rejects if over limit)
 */
export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  
  if (method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  const supabase = useServiceSupabaseClient()
  const body = await readBody<WebhookPayload>(event)

  // Validate required fields
  if (!body?.secret) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing webhook secret'
    })
  }

  try {
    // Step 1: Find user by webhook secret
    const { data: credential, error: credError } = await supabase
      .from('bot_credentials')
      .select('user_id, exchange, label')
      .eq('webhook_secret', body.secret)
      .eq('exchange', 'webhook')
      .eq('environment', 'production')
      .maybeSingle()

    if (credError || !credential) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid webhook secret'
      })
    }

    const userId = credential.user_id

    // Step 2: Get user's subscription plan from subscriptions table
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .maybeSingle()

    // Use database function for safe fallback, or default to 'Free'
    let userPlan = 'Free'
    if (subscription && subscription.status === 'active') {
      userPlan = subscription.plan
    } else {
      // Fallback: Use database function if available, otherwise default to Free
      const { data: planFromFunction } = await supabase
        .rpc('get_user_subscription_plan_safe', { p_user_id: userId })
      
      if (planFromFunction) {
        userPlan = planFromFunction
      }
    }

    // Step 3: Check webhook limit using database function
    const { data: limitCheck, error: limitError } = await supabase
      .rpc('check_webhook_limit', {
        p_user_id: userId,
        p_plan: userPlan
      })

    if (limitError) {
      console.error('Error checking webhook limit:', limitError)
      // If function doesn't exist yet, we'll do a manual check
      const { count } = await supabase
        .from('webhook_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .neq('status', 'rate_limited')

      const currentCount = count || 0
      let limit = 5 // Free tier default
      
      switch (userPlan) {
        case 'Pro':
          limit = 999999999 // Unlimited
          break
        case 'Premium':
          limit = 5000
          break
        case 'Basic':
          limit = 1000
          break
        default:
          limit = 5 // Free
      }

      if (currentCount >= limit) {
        // Log as rate limited
        await supabase
          .from('webhook_requests')
          .insert({
            user_id: userId,
            webhook_secret: body.secret,
            exchange: body.exchange || 'unknown',
            action: body.action || 'unknown',
            symbol: body.symbol || 'unknown',
            payload: body,
            status: 'rate_limited',
            error_message: `Monthly limit exceeded: ${currentCount}/${limit}`
          })

        throw createError({
          statusCode: 429,
          statusMessage: 'Webhook limit exceeded',
          data: {
            current: currentCount,
            limit,
            plan: userPlan,
            resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
          }
        })
      }
    } else if (limitCheck === false) {
      // Function returned false (over limit)
      throw createError({
        statusCode: 429,
        statusMessage: 'Webhook limit exceeded for your plan'
      })
    }

    // Step 4: Log the webhook request
    const { data: webhookLog, error: logError } = await supabase
      .from('webhook_requests')
      .insert({
        user_id: userId,
        webhook_secret: body.secret,
        exchange: body.exchange || 'unknown',
        action: body.action || 'unknown',
        symbol: body.symbol || 'unknown',
        payload: body,
        status: 'pending'
      })
      .select()
      .single()

    if (logError) {
      console.error('Error logging webhook request:', logError)
      // Don't fail the webhook if logging fails, but log the error
    }

    // Step 5: Process the webhook
    // TODO: Implement actual webhook processing logic here
    // This would typically:
    // - Validate the payload
    // - Execute the trade on the exchange
    // - Update the webhook request status to 'processed' or 'failed'
    
    // For now, we'll just mark it as processed
    if (webhookLog) {
      await supabase
        .from('webhook_requests')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString()
        })
        .eq('id', webhookLog.id)
    }

    // Return success response
    return {
      success: true,
      message: 'Webhook received and processed',
      webhook_id: webhookLog?.id
    }

  } catch (error: any) {
    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error
    }

    // Otherwise, return a generic error
    console.error('Webhook processing error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error processing webhook',
      data: error.message
    })
  }
})

