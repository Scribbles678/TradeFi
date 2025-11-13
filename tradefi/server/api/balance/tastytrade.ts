import { defineEventHandler, useRuntimeConfig } from '#imports'

interface TastyTradeAccount {
  account_number: string
  day_trade_buying_power: number
  net_liquidation_value: number
  total_equity: number
  total_cash: number
  buying_power: number
  maintenance_requirement: number
  margin_equity: number
  day_trade_excess: number
  overnight_buying_power: number
  unsettled_funds: number
  pending_deposits: number
  pending_orders_market_value: number
  long_stock_value: number
  short_stock_value: number
  long_derivative_value: number
  short_derivative_value: number
  long_futures_value: number
  short_futures_value: number
  futures_margin_requirement: number
  available_funds: number
  margin_requirement: number
  net_liquidation_value: number
}

interface TastyTradeResponse {
  data: {
    account: TastyTradeAccount
  }
}

export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig()
  const clientId = config.tastytradeClientId
  const clientSecret = config.tastytradeClientSecret
  const username = config.tastytradeUsername
  const password = config.tastytradePassword
  const accountId = config.tastytradeAccountId

  // Early return if Tasty Trade is not configured - fail silently
  if (!clientId || !clientSecret || !username || !password || !accountId) {
    return {
      success: false,
      exchange: 'Tasty Trade',
      error: 'Tasty Trade is not configured (disabled)',
      disabled: true
    }
  }

  try {
    // First, get OAuth2 token using client credentials
    const tokenResponse = await $fetch('/api/auth/tastytrade-token')
    
    // If token request failed or Tasty Trade is disabled, return early
    if (!tokenResponse.success) {
      // Don't log errors if Tasty Trade is explicitly disabled
      if (tokenResponse.disabled) {
        return {
          success: false,
          exchange: 'Tasty Trade',
          error: 'Tasty Trade is disabled',
          disabled: true
        }
      }
      return {
        success: false,
        exchange: 'Tasty Trade',
        error: `OAuth2 token failed: ${tokenResponse.error}`
      }
    }

    const accessToken = tokenResponse.access_token

    // Tasty Trade API endpoint for account information
    // Based on https://developer.tastytrade.com/ - uses OAuth2 Bearer token
    const response = await $fetch<TastyTradeResponse>(`https://api.tastytrade.com/accounts/${accountId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('Tasty Trade API Response:', response)

    if (!response?.data?.account) {
      return {
        success: false,
        exchange: 'Tasty Trade',
        error: 'Invalid response from Tasty Trade API'
      }
    }

    const account = response.data.account
    const totalEquity = account.net_liquidation_value || account.total_equity || 0
    const availableFunds = account.available_funds || 0
    const buyingPower = account.buying_power || 0
    const longFuturesValue = account.long_futures_value || 0
    const shortFuturesValue = account.short_futures_value || 0
    const futuresMarginRequirement = account.futures_margin_requirement || 0

    return {
      success: true,
      exchange: 'Tasty Trade',
      balance: totalEquity,
      availableFunds,
      buyingPower,
      longFuturesValue,
      shortFuturesValue,
      futuresMarginRequirement,
      dayTradeBuyingPower: account.day_trade_buying_power || 0,
      overnightBuyingPower: account.overnight_buying_power || 0,
      marginEquity: account.margin_equity || 0,
      maintenanceRequirement: account.maintenance_requirement || 0
    }
  } catch (error: unknown) {
    // Silently fail if it's a 401 (unauthorized) - means credentials are invalid/disabled
    // Don't log 401 errors to avoid console spam
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const is401 = errorMessage.includes('401') || errorMessage.includes('Unauthorized')
    
    // Only log if it's not a 401 error
    if (!is401) {
      console.error('Tasty Trade balance error:', error)
    }
    
    return {
      success: false,
      exchange: 'Tasty Trade',
      error: is401 ? 'Tasty Trade is disabled (invalid credentials)' : errorMessage,
      disabled: true // Always mark as disabled on error
    }
  }
})
