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

    // Fetch positions from OANDA API
    const response = await $fetch<any>(`${baseUrl}/v3/accounts/${accountId}/positions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('OANDA Positions API Response:', response)

    // Get positions from the response
    const positions = response?.positions || []
    
    // Filter only positions with non-zero amounts (active positions)
    const activePositions = positions.filter((pos: any) => 
      parseFloat(pos.long?.units || '0') !== 0 || parseFloat(pos.short?.units || '0') !== 0
    )

    console.log('OANDA Active Positions:', activePositions.length)

    // Transform positions to match dashboard format
    const formattedPositions = activePositions.map((pos: any) => {
      const longUnits = parseFloat(pos.long?.units || '0')
      const shortUnits = parseFloat(pos.short?.units || '0')
      
      // Determine which side has the position
      const isLong = longUnits > 0
      const units = isLong ? longUnits : Math.abs(shortUnits)
      const side = isLong ? 'BUY' : 'SELL'
      
      // Calculate P&L (unrealized)
      const unrealizedPnl = isLong 
        ? parseFloat(pos.long?.unrealizedPL || '0')
        : parseFloat(pos.short?.unrealizedPL || '0')
      
      // Calculate position size in USD
      const positionSizeUsd = Math.abs(units * parseFloat(pos.long?.averagePrice || pos.short?.averagePrice || '0'))
      
      return {
        id: `${pos.instrument}_${side}`,
        symbol: pos.instrument,
        side: side,
        entry_price: parseFloat(pos.long?.averagePrice || pos.short?.averagePrice || '0'),
        current_price: parseFloat(pos.long?.averagePrice || pos.short?.averagePrice || '0'), // OANDA doesn't provide current price in positions
        quantity: units,
        position_size_usd: positionSizeUsd,
        unrealized_pnl_usd: unrealizedPnl,
        unrealized_pnl_percent: positionSizeUsd > 0 ? (unrealizedPnl / positionSizeUsd) * 100 : 0,
        entry_time: new Date().toISOString(), // We don't have entry time from this API
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
