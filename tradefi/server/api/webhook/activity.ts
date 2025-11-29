import { defineEventHandler, getQuery, createError } from 'h3'
import { useServiceSupabaseClient } from '~/utils/supabase'
import { serverSupabaseClient } from '#supabase/server'

/**
 * Get webhook activity for the authenticated user
 * Query params: limit (default: 10)
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
  const query = getQuery(event)
  const limit = parseInt(query.limit as string) || 10

  // Get user from session
  const clientSupabase = await serverSupabaseClient(event)
  const { data: { session }, error: sessionError } = await clientSupabase.auth.getSession()
  
  if (sessionError || !session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const userId = session.user.id

  try {
    // Fetch recent webhook requests for this user
    const { data: webhooks, error } = await supabase
      .from('webhook_requests')
      .select('id, exchange, action, symbol, status, created_at, processed_at, error_message')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching webhook activity:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch webhook activity',
        data: error.message
      })
    }

    return {
      data: webhooks || []
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Unexpected error fetching webhook activity:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
      data: error.message
    })
  }
})

