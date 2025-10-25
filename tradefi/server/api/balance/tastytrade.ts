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

  try {
    if (!clientId || !clientSecret || !username || !password || !accountId) {
      console.log('Tasty Trade missing OAuth2 config')
      return {
        success: false,
        exchange: 'Tasty Trade',
        error: 'Missing Tasty Trade OAuth2 configuration'
      }
    }

    // First, get OAuth2 token using client credentials
    const tokenResponse = await $fetch('/api/auth/tastytrade-token')
    
    if (!tokenResponse.success) {
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
    console.error('Tasty Trade balance error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return {
      success: false,
      exchange: 'Tasty Trade',
      error: errorMessage
    }
  }
})
