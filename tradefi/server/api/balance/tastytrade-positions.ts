import { defineEventHandler, useRuntimeConfig } from '#imports'

interface TastyTradePosition {
  symbol: string
  instrument_type: string
  quantity: number
  average_price: number
  market_value: number
  unrealized_pnl: number
  realized_pnl: number
  day_pnl: number
  cost_basis: number
  position_type: string
  underlying_symbol: string
  expiration_date?: string
  strike_price?: number
  option_type?: string
}

interface TastyTradePositionsResponse {
  data: {
    items: TastyTradePosition[]
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
      positions: [],
      count: 0,
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
          positions: [],
          count: 0,
          error: 'Tasty Trade is disabled',
          disabled: true
        }
      }
      return {
        success: false,
        exchange: 'Tasty Trade',
        positions: [],
        count: 0,
        error: `OAuth2 token failed: ${tokenResponse.error}`
      }
    }

    const accessToken = tokenResponse.access_token

    // Fetch positions from Tasty Trade API
    // Based on https://developer.tastytrade.com/ - uses OAuth2 Bearer token
    const response = await $fetch<TastyTradePositionsResponse>(`https://api.tastytrade.com/accounts/${accountId}/positions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('Tasty Trade Positions API Response:', response)

    // Get positions from the response
    const positions = response?.data?.items || []
    
    // Filter only positions with non-zero quantities (active positions)
    const activePositions = positions.filter((pos: TastyTradePosition) => 
      pos.quantity !== 0
    )

    console.log('Tasty Trade Active Positions:', activePositions.length)

    // Transform positions to match dashboard format
    const formattedPositions = activePositions.map((pos: TastyTradePosition) => {
      const side = pos.quantity > 0 ? 'BUY' : 'SELL'
      const quantity = Math.abs(pos.quantity)
      
      return {
        id: `${pos.symbol}_${side}`,
        symbol: pos.symbol,
        side: side,
        entry_price: pos.average_price,
        current_price: pos.average_price, // Tasty Trade doesn't provide current price in positions
        quantity: quantity,
        position_size_usd: Math.abs(pos.market_value),
        unrealized_pnl_usd: pos.unrealized_pnl,
        unrealized_pnl_percent: pos.market_value !== 0 ? (pos.unrealized_pnl / Math.abs(pos.market_value)) * 100 : 0,
        entry_time: new Date().toISOString(), // We don't have entry time from this API
        exchange: 'tastytrade',
        asset_class: 'futures',
        instrument_type: pos.instrument_type,
        underlying_symbol: pos.underlying_symbol,
        expiration_date: pos.expiration_date,
        strike_price: pos.strike_price,
        option_type: pos.option_type
      }
    })

    return {
      success: true,
      exchange: 'Tasty Trade',
      positions: formattedPositions,
      count: formattedPositions.length
    }
  } catch (error) {
    // Silently fail if it's a 401 (unauthorized) - means credentials are invalid/disabled
    // Don't log 401 errors to avoid console spam
    const errorMessage = error instanceof Error ? error.message : String(error)
    const is401 = errorMessage.includes('401') || errorMessage.includes('Unauthorized')
    
    // Only log if it's not a 401 error
    if (!is401) {
      console.error('Tasty Trade Positions API Error:', error)
    }
    
    return {
      success: false,
      exchange: 'Tasty Trade',
      positions: [],
      count: 0,
      error: is401 ? 'Tasty Trade is disabled (invalid credentials)' : errorMessage,
      disabled: true // Always mark as disabled on error
    }
  }
})
