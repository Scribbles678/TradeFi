import { defineEventHandler, useRuntimeConfig, createError } from '#imports'
import { serverSupabaseClient } from '#supabase/server'

interface TradierBalances {
  total_equity: number
  total_cash: number
  total_margin_equity: number
  total_market_value: number
  option_market_value: number
  stock_market_value: number
  buying_power: {
    cash_available: number
    day_trade: number
    overnight: number
  }
  cash: {
    cash_available: number
    cash_held: number
    cash_sweep: number
  }
}

interface TradierResponse {
  balances: TradierBalances
}

export default defineEventHandler(async (event): Promise<any> => {
  // Get authenticated user
  const user = event.context.user
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Please log in'
    })
  }

  // Get user's API credentials from database
  const supabase = await serverSupabaseClient(event)
  const { data: credentials, error: credError } = await supabase
    .from('bot_credentials')
    .select('api_key, account_id')
    .eq('exchange', 'tradier')
    .single()

  if (credError || !credentials) {
    return {
      success: false,
      exchange: 'Tradier',
      balance: null,
      error: 'Tradier credentials not configured'
    }
  }

  const token = credentials.api_key
  const accountId = credentials.account_id

  try {
    const response: TradierResponse = await $fetch<TradierResponse>(`https://sandbox.tradier.com/v1/accounts/${accountId}/balances`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    })
    
    console.log('Tradier API Response:', response)
    
    const balances = response?.balances
    if (!balances) {
      return {
        success: false,
        exchange: 'Tradier',
        balance: null,
        error: 'Invalid response from Tradier API'
      }
    }

    const totalEquity = balances.total_equity
    const totalCash = balances.total_cash
    const totalMarketValue = balances.total_market_value
    const buyingPower = balances.buying_power?.cash_available || 0
    const cashAvailable = balances.cash?.cash_available || 0

    return {
      success: true,
      exchange: 'Tradier',
      balance: totalEquity,
      totalCash,
      totalMarketValue,
      buyingPower,
      cashAvailable,
      optionMarketValue: balances.option_market_value,
      stockMarketValue: balances.stock_market_value
    }
  } catch (error) {
    console.error('Tradier API Error:', error)
    return {
      success: false,
      exchange: 'Tradier',
      balance: null,
      error: error instanceof Error ? error.message : String(error)
    }
  }
})
