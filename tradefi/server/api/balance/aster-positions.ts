import { defineEventHandler, useRuntimeConfig } from '#imports'
import { createHmac } from 'node:crypto'

export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig()
  const apiKey = config.asterApiKey
  const apiSecret = config.asterApiSecret

  try {
    // Prepare request details for Aster DEX account info (includes positions)
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

    console.log('Aster DEX Account API Response:', response)
    console.log('Aster DEX Positions from account:', response?.positions?.length || 0, 'positions found')

    // Get positions from the account response
    const positions = response?.positions || []
    
    // Filter only positions with non-zero amounts (active positions)
    const activePositions = positions.filter((pos: any) => 
      parseFloat(pos.positionAmt) !== 0
    )

    console.log('Aster DEX Active Positions:', activePositions.length)

    // Transform positions to match dashboard format
    const formattedPositions = activePositions.map((pos: any) => ({
      id: `${pos.symbol}_${pos.positionSide}`,
      symbol: pos.symbol,
      side: parseFloat(pos.positionAmt) > 0 ? 'BUY' : 'SELL',
      entry_price: parseFloat(pos.entryPrice),
      current_price: parseFloat(pos.markPrice),
      quantity: Math.abs(parseFloat(pos.positionAmt)),
      position_size_usd: Math.abs(parseFloat(pos.notional)),
      unrealized_pnl_usd: parseFloat(pos.unrealizedProfit),
      unrealized_pnl_percent: parseFloat(pos.unrealizedProfit) / Math.abs(parseFloat(pos.notional)) * 100,
      entry_time: new Date().toISOString(), // We don't have entry time from this API
      exchange: 'aster',
      asset_class: 'crypto'
    }))

    return {
      success: true,
      exchange: 'Aster DEX',
      positions: formattedPositions,
      count: formattedPositions.length
    }
  } catch (error) {
    console.error('Aster DEX Positions API Error:', error)
    return {
      success: false,
      exchange: 'Aster DEX',
      positions: [],
      count: 0,
      error: error instanceof Error ? error.message : String(error)
    }
  }
})
