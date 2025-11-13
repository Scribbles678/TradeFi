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

    console.log('Aster DEX Active Positions (before filtering):', activePositions.length)
    
    // Filter out forex pairs (Aster DEX should only have crypto positions)
    // Forex pairs typically have underscores (EUR_USD) or match forex patterns
    const cryptoOnlyPositions = activePositions.filter((pos: any) => {
      const symbol = (pos.symbol || '').toUpperCase()
      // Exclude forex pairs (contain underscore and match forex pattern like EUR_USD, GBP_USD)
      const isForexPair = symbol.includes('_') && symbol.match(/^[A-Z]{3}_[A-Z]{3}$/)
      // Exclude forex pairs with slash (EUR/USD, GBP/USD)
      const isForexPairSlash = symbol.includes('/') && symbol.match(/^[A-Z]{3}\/[A-Z]{3}$/)
      // Keep everything else (crypto pairs)
      return !isForexPair && !isForexPairSlash
    })

    console.log('Aster DEX Crypto Positions (after filtering):', cryptoOnlyPositions.length)
    
    if (activePositions.length !== cryptoOnlyPositions.length) {
      const filteredOut = activePositions.filter((p: any) => !cryptoOnlyPositions.includes(p))
      console.log('Aster DEX Filtered out non-crypto positions:', filteredOut.map((p: any) => p.symbol))
    }

    // Transform positions to match dashboard format
    const formattedPositions = cryptoOnlyPositions.map((pos: any) => ({
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
