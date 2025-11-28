import { defineEventHandler, useRuntimeConfig, createError } from '#imports'
import { createHmac } from 'node:crypto'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event): Promise<any> => {
  // Get authenticated user
  const user = event.context.user
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Please log in'
    })
  }

  // Get user's API credentials from database (production only)
  const supabase = await serverSupabaseClient(event)
  const { data: credentials, error: credError } = await supabase
    .from('bot_credentials')
    .select('api_key, api_secret')
    .eq('exchange', 'aster')
    .eq('environment', 'production')
    .eq('user_id', user.id)
    .single()

  if (credError || !credentials) {
    return {
      success: false,
      exchange: 'Aster DEX',
      balance: null,
      error: 'Aster DEX credentials not configured'
    }
  }

  const apiKey = credentials.api_key
  const apiSecret = credentials.api_secret

  try {
    // Prepare request details for Aster DEX - use v4/account endpoint for comprehensive balance data
    const baseUrl = 'https://fapi.asterdex.com'
    const endpoint = '/fapi/v4/account'
    const url = baseUrl + endpoint
    const method = 'GET'
    const timestamp = Date.now().toString()
    
    // Create query string for signature
    const queryString = `timestamp=${timestamp}`
    const signature = createHmac('sha256', apiSecret).update(queryString).digest('hex')

    // Make the API request
    const response = await $fetch<any>(`${url}?${queryString}&signature=${signature}`, {
      method,
      headers: {
        'X-MBX-APIKEY': apiKey,
        'Content-Type': 'application/json'
      }
    })

    // Parse the response from v4/account endpoint - has comprehensive balance data
    // Only log essential balance info to avoid console flooding
    console.log('Aster DEX Balance:', response?.totalMarginBalance)
    
    // Use totalMarginBalance from v4/account endpoint (this should be the total account balance)
    const balance = response?.totalMarginBalance ? parseFloat(response.totalMarginBalance) : 0
    
    // Only log the final balance to avoid console flooding
    console.log('Aster DEX Final Balance:', balance)

    return {
      success: true,
      exchange: 'Aster DEX',
      balance,
      availableBalance: response?.availableBalance ? parseFloat(response.availableBalance) : null,
      totalUnrealizedPnl: response?.totalUnrealizedPnl ? parseFloat(response.totalUnrealizedPnl) : null,
      totalMarginBalance: response?.totalMarginBalance ? parseFloat(response.totalMarginBalance) : null
    }
  } catch (error) {
    console.error('Aster DEX API Error:', error)
    return {
      success: false,
      exchange: 'Aster DEX',
      balance: null,
      error: error instanceof Error ? error.message : String(error)
    }
  }
})
