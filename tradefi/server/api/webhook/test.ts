import { defineEventHandler, readBody, createError } from 'h3'
import { useServiceSupabaseClient } from '~/utils/supabase'
import { serverSupabaseClient } from '#supabase/server'

/**
 * Test webhook endpoint
 * POST /api/webhook/test
 * 
 * Validates that the webhook secret exists and is properly configured
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

  const body = await readBody<{ webhook_secret: string; test?: boolean }>(event)

  if (!body?.webhook_secret) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Webhook secret is required'
    })
  }

  try {
    // Verify the webhook secret exists for this user
    const { data: credential, error: credError } = await supabase
      .from('bot_credentials')
      .select('id, exchange, label, webhook_secret')
      .eq('user_id', userId)
      .eq('exchange', 'webhook')
      .eq('webhook_secret', body.webhook_secret)
      .maybeSingle()

    if (credError) {
      console.error('Error checking webhook secret:', credError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to verify webhook secret',
        data: credError.message
      })
    }

    if (!credential) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Webhook secret not found or does not match'
      })
    }

    // Test is successful if we can verify the secret exists
    return {
      success: true,
      message: 'Webhook secret is valid and configured correctly',
      credential: {
        id: credential.id,
        label: credential.label,
        exchange: credential.exchange
      }
    }
  } catch (error: any) {
    console.error('Webhook test error:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to test webhook',
      data: error.message
    })
  }
})

