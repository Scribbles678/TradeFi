import { defineEventHandler, useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig()
  const apiKey = config.oandaApiKey
  const baseUrl = config.oandaBaseUrl

  try {
    // Get OANDA account ID from config
    const accountId = config.oandaAccountId

    if (!accountId) {
      throw new Error('OANDA Account ID not configured')
    }

    // Ensure baseUrl doesn't end with slash to avoid double slashes
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl

    // Fetch open positions from OANDA API (more efficient than /positions)
    const positionsResponse = await $fetch<any>(`${cleanBaseUrl}/v3/accounts/${accountId}/openPositions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('OANDA Open Positions API Response:', positionsResponse)

    // Get positions from the response
    const positions = positionsResponse?.positions || []
    
    console.log('OANDA Active Positions:', positions.length)

    // Get list of instruments for pricing (OANDA pricing API format)
    const instruments = positions.map((pos: any) => pos.instrument)
    
    // Fetch current prices for all positions using OANDA pricing API
    // OANDA pricing endpoint: /v3/accounts/{accountID}/pricing?instruments={comma-separated-list}
    let pricingData: any = {}
    if (instruments.length > 0) {
      try {
        // OANDA pricing API expects comma-separated list of instruments
        const instrumentsList = instruments.join(',')
        const pricingResponse = await $fetch<any>(`${cleanBaseUrl}/v3/accounts/${accountId}/pricing?instruments=${encodeURIComponent(instrumentsList)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        })

        console.log('OANDA Pricing API Response:', pricingResponse)

        // Create a map of instrument to current price
        if (pricingResponse?.prices) {
          pricingResponse.prices.forEach((price: any) => {
            // Use mid price (average of bid and ask) for current price
            const bid = parseFloat(price.bids?.[0]?.price || '0')
            const ask = parseFloat(price.asks?.[0]?.price || '0')
            if (bid > 0 && ask > 0) {
              pricingData[price.instrument] = (bid + ask) / 2
            } else if (bid > 0) {
              pricingData[price.instrument] = bid
            } else if (ask > 0) {
              pricingData[price.instrument] = ask
            }
          })
        }
        console.log('OANDA Pricing Data:', pricingData)
      } catch (pricingError) {
        console.error('Error fetching OANDA pricing (will calculate from P&L):', pricingError)
        console.error('Pricing error details:', pricingError instanceof Error ? pricingError.message : String(pricingError))
        // Continue without pricing data - we'll calculate from unrealized P&L
      }
    }

    // Transform positions to match dashboard format
    const formattedPositions = positions.map((pos: any) => {
      const longUnits = parseFloat(pos.long?.units || '0')
      const shortUnits = parseFloat(pos.short?.units || '0')
      
      // Determine which side has the position
      const isLong = longUnits > 0
      const units = isLong ? longUnits : Math.abs(shortUnits)
      const side = isLong ? 'BUY' : 'SELL'
      
      // Get entry price (average price) - OANDA provides this in the position data
      const entryPrice = parseFloat(isLong ? (pos.long?.averagePrice || '0') : (pos.short?.averagePrice || '0'))
      
      // Get unrealized P&L (OANDA provides this directly in account currency, usually USD)
      // This is the most accurate source of P&L information
      const unrealizedPnl = parseFloat(isLong ? (pos.long?.unrealizedPL || '0') : (pos.short?.unrealizedPL || '0'))
      
      console.log(`OANDA Position ${pos.instrument}:`, {
        side,
        units,
        entryPrice,
        unrealizedPnl,
        longData: pos.long,
        shortData: pos.short
      })
      
      // Get current price from pricing data if available
      let currentPrice = pricingData[pos.instrument]
      
      // If we don't have pricing data, calculate current price from unrealized P&L
      // For forex pairs: unrealizedPnl (in USD) = (currentPrice - entryPrice) * units (for long)
      // Rearranging: currentPrice = entryPrice + (unrealizedPnl / units)
      // Note: This assumes unrealizedPnl is in the quote currency (USD for EUR_USD)
      if (!currentPrice && units > 0 && entryPrice > 0) {
        if (isLong) {
          // For long positions: if unrealizedPnl is positive, current price is higher than entry
          currentPrice = entryPrice + (unrealizedPnl / units)
        } else {
          // For short positions: if unrealizedPnl is positive, current price is lower than entry
          currentPrice = entryPrice - (unrealizedPnl / units)
        }
      }
      
      // Fallback to entry price if we can't calculate (shouldn't happen, but safety check)
      if (!currentPrice || currentPrice <= 0 || isNaN(currentPrice)) {
        currentPrice = entryPrice
      }
      
      // Calculate position size in USD (notional value)
      // For forex: position size = units * entry price (in quote currency)
      // Example: 10,000 EUR at 1.17 = $11,700 USD
      const positionSizeUsd = Math.abs(units * entryPrice)
      
      // Calculate P&L percentage
      // Percentage = (unrealizedPnl / positionSizeUsd) * 100
      // Example: $100 P&L on $11,700 position = 0.85%
      const unrealizedPnlPercent = positionSizeUsd > 0 ? (unrealizedPnl / positionSizeUsd) * 100 : 0
      
      console.log(`OANDA Position ${pos.instrument} formatted:`, {
        symbol: pos.instrument,
        side,
        entryPrice,
        currentPrice,
        units,
        positionSizeUsd,
        unrealizedPnl,
        unrealizedPnlPercent
      })
      
      return {
        id: `${pos.instrument}_${side}_${accountId}`,
        symbol: pos.instrument,
        side: side,
        entry_price: entryPrice,
        current_price: currentPrice,
        quantity: units,
        position_size_usd: positionSizeUsd,
        unrealized_pnl_usd: unrealizedPnl,
        unrealized_pnl_percent: unrealizedPnlPercent,
        entry_time: pos.long?.tradeIDs?.[0] ? new Date().toISOString() : new Date().toISOString(), // OANDA doesn't provide entry time directly
        exchange: 'oanda',
        asset_class: 'forex'
      }
    })

    return {
      success: true,
      exchange: 'OANDA',
      positions: formattedPositions,
      count: formattedPositions.length
    }
  } catch (error) {
    console.error('OANDA Positions API Error:', error)
    return {
      success: false,
      exchange: 'OANDA',
      positions: [],
      count: 0,
      error: error instanceof Error ? error.message : String(error)
    }
  }
})
