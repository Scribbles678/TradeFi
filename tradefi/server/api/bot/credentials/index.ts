import { createError, getMethod, readBody, getQuery, defineEventHandler } from 'h3'
import { useServiceSupabaseClient } from '~/utils/supabase'
import { serverSupabaseClient } from '#supabase/server'

type BotCredentialPayload = {
  id?: string | null
  label?: string
  exchange: string
  environment?: string
  accountId?: string | null
  apiKey?: string | null
  apiSecret?: string | null
  passphrase?: string | null
  webhookSecret?: string | null
  extraMetadata?: Record<string, any> | null
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = useServiceSupabaseClient()
  
  // Get user from context (set by middleware) or directly from Supabase session
  let user = event.context.user
  
  if (!user) {
    // Fallback: get user directly from Supabase session
    try {
      const clientSupabase = await serverSupabaseClient(event)
      
      // First try to get the session (reads from cookies)
      const { data: { session }, error: sessionError } = await clientSupabase.auth.getSession()
      
      if (!sessionError && session?.user) {
        user = session.user
      } else {
        // Fallback: try getUser() (requires valid access token in header)
        const { data: { user: sessionUser }, error } = await clientSupabase.auth.getUser()
        
        if (error || !sessionUser) {
          // Log more details in development
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to get user:', {
              sessionError: sessionError?.message,
              getUserError: error?.message,
              hasSession: !!session,
              cookies: event.node.req.headers.cookie ? 'present' : 'missing'
            })
          }
          throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized - Please log in. Make sure you are logged in and your session is active.'
          })
        }
        user = sessionUser
      }
    } catch (err: any) {
      // Don't re-throw if it's already a createError
      if (err.statusCode) {
        throw err
      }
      console.error('Error getting user:', err)
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Please log in'
      })
    }
  }
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Please log in'
    })
  }

  switch (method) {
    case 'GET': {
      // Only return production credentials (ignore practice/paper)
      try {
        if (!user?.id) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid user ID'
          })
        }

        const { data, error } = await supabase
          .from('bot_credentials')
          .select('*')
          .eq('user_id', user.id)
          .eq('environment', 'production')
          .order('label', { ascending: true })
        
        // Log for debugging in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Credentials query result:', {
            userId: user.id,
            dataCount: data?.length || 0,
            error: error?.message || null
          })
        }

        if (error) {
          console.error('Database error loading credentials:', {
            error: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            userId: user.id
          })
          throw createError({
            statusCode: 500,
            statusMessage: 'Failed to load bot credentials',
            data: error.message
          })
        }

        return { data: data || [] }
      } catch (err: any) {
        // Re-throw if it's already a createError
        if (err.statusCode) {
          throw err
        }
        console.error('Unexpected error in GET credentials:', err)
        throw createError({
          statusCode: 500,
          statusMessage: 'Internal server error',
          data: err.message
        })
      }
    }

    case 'POST': {
      const payload = await readBody<BotCredentialPayload>(event)

      if (!payload?.exchange) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Exchange is required'
        })
      }

      const normalized = normalizePayload(payload)

      // Query by exchange (always use production environment)
      const { data: existing } = await supabase
        .from('bot_credentials')
        .select('*')
        .eq('exchange', normalized.exchange)
        .eq('environment', 'production') // Always use production
        .eq('user_id', user.id)
        .maybeSingle()

      let upsertResult

      if (existing) {
        const { data, error } = await supabase
          .from('bot_credentials')
          .update({
            ...normalized.fields,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .eq('user_id', user.id)
          .select()
          .single()

        if (error) {
          throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update credential',
            data: error.message
          })
        }

        upsertResult = data
      } else {
        const { data, error} = await supabase
          .from('bot_credentials')
          .insert({
            exchange: normalized.exchange,
            user_id: user.id,
            ...normalized.fields
          })
          .select()
          .single()

        if (error) {
          throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create credential',
            data: error.message
          })
        }

        upsertResult = data
      }

      return {
        success: true,
        credential: upsertResult
      }
    }

    case 'DELETE': {
      const query = getQuery(event)
      const exchange = typeof query.exchange === 'string' ? query.exchange : null
      const environment = typeof query.environment === 'string' ? query.environment : 'production'

      if (!exchange) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Exchange query parameter is required'
        })
      }

      // Delete by exchange (always delete production environment)
      const { error } = await supabase
        .from('bot_credentials')
        .delete()
        .eq('exchange', exchange)
        .eq('environment', 'production') // Always delete production
        .eq('user_id', user.id)

      if (error) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to delete credential',
          data: error.message
        })
      }

      return { success: true }
    }

    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
  }
})

function normalizePayload(payload: BotCredentialPayload) {
  const defaultLabel = payload.exchange === 'webhook'
    ? 'TradingView Webhook'
    : `${payload.exchange.toUpperCase()} Account`

  return {
    exchange: payload.exchange,
    fields: {
      label: payload.label || defaultLabel,
      environment: 'production', // Always use production
      account_id: payload.accountId || null,
      api_key: payload.apiKey || null,
      api_secret: payload.apiSecret || null,
      passphrase: payload.passphrase || null,
      webhook_secret: payload.webhookSecret || null,
      extra_metadata: payload.extraMetadata || {}
    }
  }
}

