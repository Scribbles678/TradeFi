import { defineEventHandler, useRuntimeConfig } from '#imports'
import { getOpenPositions, saveTrade, getRecentTrades, savePosition, updatePosition, type Trade, type Position } from '~/utils/supabase'
import { createHmac } from 'node:crypto'

/**
 * Sync endpoint that detects closed positions and saves them as trades
 * This endpoint compares current API positions with Supabase positions
 * When a position disappears, it means it was closed, so we save it as a trade
 */
export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig()
  
  try {
    console.log('Trade Sync: Starting sync process...')
    
    // Get current positions from APIs
    const asterApiKey = config.asterApiKey
    const asterApiSecret = config.asterApiSecret
    const oandaApiKey = config.oandaApiKey
    const oandaBaseUrl = config.oandaBaseUrl
    const oandaAccountId = config.oandaAccountId
    
    const currentApiPositions: Map<string, any> = new Map()
    const closedTrades: any[] = []
    
    // Fetch current Aster DEX positions
    try {
      const baseUrl = 'https://fapi.asterdex.com'
      const endpoint = '/fapi/v4/account'
      const timestamp = Date.now().toString()
      const queryString = `timestamp=${timestamp}`
      const signature = createHmac('sha256', asterApiSecret).update(queryString).digest('hex')
      
      const asterResponse = await $fetch<any>(`${baseUrl}${endpoint}?${queryString}&signature=${signature}`, {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': asterApiKey,
          'Content-Type': 'application/json'
        }
      })
      
      const asterPositions = (asterResponse?.positions || []).filter((pos: any) => {
        const symbol = (pos.symbol || '').toUpperCase()
        const isForexPair = symbol.includes('_') && symbol.match(/^[A-Z]{3}_[A-Z]{3}$/)
        const isForexPairSlash = symbol.includes('/') && symbol.match(/^[A-Z]{3}\/[A-Z]{3}$/)
        return parseFloat(pos.positionAmt) !== 0 && !isForexPair && !isForexPairSlash
      })
      
      asterPositions.forEach((pos: any) => {
        const key = `aster_${pos.symbol}_${pos.positionSide}`
        const quantity = Math.abs(parseFloat(pos.positionAmt))
        const entryPrice = parseFloat(pos.entryPrice)
        const currentPrice = parseFloat(pos.markPrice)
        const positionSizeUsd = Math.abs(parseFloat(pos.notional))
        const unrealizedPnl = parseFloat(pos.unrealizedProfit)
        const unrealizedPnlPercent = positionSizeUsd > 0 ? (unrealizedPnl / positionSizeUsd) * 100 : 0
        
        currentApiPositions.set(key, {
          symbol: pos.symbol,
          exchange: 'aster',
          asset_class: 'crypto',
          entry_price: entryPrice,
          current_price: currentPrice,
          quantity: quantity,
          position_size_usd: positionSizeUsd,
          unrealized_pnl_usd: unrealizedPnl,
          unrealized_pnl_percent: unrealizedPnlPercent,
          side: parseFloat(pos.positionAmt) > 0 ? 'BUY' : 'SELL'
        })
      })
      
      console.log('Trade Sync: Found', asterPositions.length, 'current Aster DEX positions')
    } catch (error) {
      console.error('Trade Sync: Error fetching Aster DEX positions:', error)
    }
    
    // Fetch current OANDA positions
    try {
      if (oandaAccountId && oandaApiKey && oandaBaseUrl) {
        const cleanBaseUrl = oandaBaseUrl.endsWith('/') ? oandaBaseUrl.slice(0, -1) : oandaBaseUrl
        const oandaResponse = await $fetch<any>(`${cleanBaseUrl}/v3/accounts/${oandaAccountId}/openPositions`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${oandaApiKey}`,
            'Content-Type': 'application/json'
          }
        })
        
        const oandaPositions = oandaResponse?.positions || []
        oandaPositions.forEach((pos: any) => {
          const longUnits = parseFloat(pos.long?.units || '0')
          const shortUnits = parseFloat(pos.short?.units || '0')
          const isLong = longUnits > 0
          const units = isLong ? longUnits : Math.abs(shortUnits)
          const entryPrice = parseFloat(isLong ? (pos.long?.averagePrice || '0') : (pos.short?.averagePrice || '0'))
          const unrealizedPnl = parseFloat(isLong ? (pos.long?.unrealizedPL || '0') : (pos.short?.unrealizedPL || '0'))
          const positionSizeUsd = Math.abs(units * entryPrice)
          const unrealizedPnlPercent = positionSizeUsd > 0 ? (unrealizedPnl / positionSizeUsd) * 100 : 0
          
          // Try to get current price from pricing API
          let currentPrice = entryPrice
          try {
            // We'll use entry price + P&L to estimate current price for forex
            if (units > 0 && entryPrice > 0) {
              currentPrice = isLong ? entryPrice + (unrealizedPnl / units) : entryPrice - (unrealizedPnl / units)
            }
          } catch (e) {
            // Use entry price as fallback
          }
          
          const key = `oanda_${pos.instrument}_${isLong ? 'LONG' : 'SHORT'}`
          currentApiPositions.set(key, {
            symbol: pos.instrument,
            exchange: 'oanda',
            asset_class: 'forex',
            entry_price: entryPrice,
            current_price: currentPrice,
            quantity: units,
            position_size_usd: positionSizeUsd,
            unrealized_pnl_usd: unrealizedPnl,
            unrealized_pnl_percent: unrealizedPnlPercent,
            side: isLong ? 'BUY' : 'SELL'
          })
        })
        
        console.log('Trade Sync: Found', oandaPositions.length, 'current OANDA positions')
      }
    } catch (error) {
      console.error('Trade Sync: Error fetching OANDA positions:', error)
    }
    
    // Step 1: Save current positions to Supabase (if they don't exist or need updating)
    // This ensures we have a record of positions for future comparison
    console.log('Trade Sync: Saving current positions to Supabase...')
    const savedPositionsMap = new Map<string, any>()
    
    // Convert API positions to Supabase format and save them
    for (const [key, apiPos] of currentApiPositions.entries()) {
      try {
        // Check if position already exists in Supabase
        const existingPositions = await getOpenPositions(apiPos.asset_class as any)
        const existingPos = existingPositions.find(p => 
          p.symbol === apiPos.symbol && 
          p.exchange === apiPos.exchange && 
          p.side === apiPos.side
        )
        
        if (existingPos) {
          // Update existing position with current data
          await updatePosition(existingPos.id, {
            current_price: apiPos.current_price,
            unrealized_pnl_usd: apiPos.unrealized_pnl_usd,
            unrealized_pnl_percent: apiPos.unrealized_pnl_percent,
            quantity: apiPos.quantity,
            position_size_usd: apiPos.position_size_usd,
            updated_at: new Date().toISOString()
          })
          savedPositionsMap.set(key, existingPos)
        } else {
          // Create new position in Supabase
          const newPosition = await savePosition({
            symbol: apiPos.symbol,
            side: apiPos.side,
            asset_class: apiPos.asset_class,
            exchange: apiPos.exchange,
            entry_price: apiPos.entry_price,
            entry_time: new Date().toISOString(),
            quantity: apiPos.quantity,
            position_size_usd: apiPos.position_size_usd,
            current_price: apiPos.current_price,
            unrealized_pnl_usd: apiPos.unrealized_pnl_usd,
            unrealized_pnl_percent: apiPos.unrealized_pnl_percent
          })
          if (newPosition) {
            savedPositionsMap.set(key, newPosition)
          }
        }
      } catch (error) {
        console.error('Trade Sync: Error saving position to Supabase:', error)
      }
    }
    
    // Step 2: Get all positions from Supabase (including ones that might be closed)
    const supabasePositions = await getOpenPositions()
    console.log('Trade Sync: Found', supabasePositions.length, 'positions in Supabase')
    
    // Get recent trades to avoid duplicates
    const recentTrades = await getRecentTrades(1000) // Get many recent trades
    const existingTradeKeys = new Set(recentTrades.map((t: Trade) => 
      `${t.exchange || 'unknown'}_${t.symbol}_${t.entry_time}`
    ))
    
    console.log('Trade Sync: Found', recentTrades.length, 'existing trades in database')
    
    // Check each Supabase position
    for (const supabasePos of supabasePositions) {
      // Skip if position has no exchange or symbol
      if (!supabasePos.exchange || !supabasePos.symbol) {
        continue
      }
      
      // Create a key to match with API positions
      const side = supabasePos.side === 'BUY' ? 'LONG' : 'SHORT'
      const positionKey = `${supabasePos.exchange.toLowerCase()}_${supabasePos.symbol}_${side}`
      
      // If position doesn't exist in current API positions, it was closed
      if (!currentApiPositions.has(positionKey)) {
        // Create a trade key to check for duplicates
        const tradeKey = `${supabasePos.exchange}_${supabasePos.symbol}_${supabasePos.entry_time}`
        
        // Skip if we already have a trade for this position
        if (!existingTradeKeys.has(tradeKey)) {
          // For closed positions, we need to calculate the realized P&L
          // The calculation depends on the exchange/asset class:
          // - For OANDA (forex): Use unrealized_pnl_usd directly (it's already in USD from the API)
          // - For Aster DEX (crypto): Use unrealized_pnl_usd directly (it's already in USD from the API)
          // - For other exchanges: Calculate from entry/exit prices
          
          const exitPrice = supabasePos.current_price || supabasePos.entry_price
          const entryPrice = supabasePos.entry_price
          const quantity = supabasePos.quantity || 0
          const positionSizeUsd = supabasePos.position_size_usd || 0
          const exchange = supabasePos.exchange?.toLowerCase()
          const assetClass = supabasePos.asset_class?.toLowerCase()
          
          let pnlUsd = 0
          let pnlPercent = 0
          
          // For OANDA (forex) and Aster DEX (crypto), use the unrealized P&L directly
          // These exchanges provide accurate USD P&L values from their APIs
          if ((exchange === 'oanda' && assetClass === 'forex') || 
              (exchange === 'aster' && assetClass === 'crypto')) {
            // Use the unrealized P&L as realized P&L (it's the actual P&L from the exchange)
            pnlUsd = supabasePos.unrealized_pnl_usd || 0
            pnlPercent = supabasePos.unrealized_pnl_percent || 0
            
            console.log(`Trade Sync: Using exchange-provided P&L for ${supabasePos.symbol} (${exchange}/${assetClass}):`, {
              unrealized_pnl_usd: pnlUsd,
              unrealized_pnl_percent: pnlPercent
            });
          } else if (entryPrice && exitPrice && quantity > 0) {
            // For other exchanges or if we don't have exchange-provided P&L,
            // calculate from entry/exit prices (only for non-forex/non-crypto)
            // This works for stocks, options, futures where price * quantity = value
            if (supabasePos.side === 'BUY') {
              pnlUsd = (exitPrice - entryPrice) * quantity
            } else {
              pnlUsd = (entryPrice - exitPrice) * quantity
            }
            
            // Calculate P&L percentage based on position size
            if (positionSizeUsd > 0) {
              pnlPercent = (pnlUsd / positionSizeUsd) * 100
            } else if (entryPrice > 0) {
              // Fallback: calculate percentage based on entry price
              pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100
              if (supabasePos.side === 'SELL') {
                pnlPercent = -pnlPercent
              }
            }
            
            console.log(`Trade Sync: Calculated P&L from prices for ${supabasePos.symbol}:`, {
              entry_price: entryPrice,
              exit_price: exitPrice,
              quantity: quantity,
              calculated_pnl_usd: pnlUsd,
              calculated_pnl_percent: pnlPercent
            });
          } else {
            // Final fallback: use unrealized P&L if available
            console.warn('Trade Sync: Using unrealized P&L as fallback for', supabasePos.symbol, '- entry/exit price calculation failed')
            pnlUsd = supabasePos.unrealized_pnl_usd || 0
            pnlPercent = supabasePos.unrealized_pnl_percent || 0
          }
          
          // Only create trade if we have valid position data
          if (supabasePos.symbol && entryPrice && quantity > 0) {
            // Create trade record
            const tradeData: Partial<Trade> = {
              symbol: supabasePos.symbol,
              side: supabasePos.side,
              asset_class: supabasePos.asset_class || (supabasePos.exchange === 'oanda' ? 'forex' : 'crypto'),
              exchange: supabasePos.exchange,
              entry_price: entryPrice,
              entry_time: supabasePos.entry_time,
              exit_price: exitPrice,
              exit_time: supabasePos.updated_at || new Date().toISOString(), // Use updated_at as exit time
              quantity: quantity,
              position_size_usd: positionSizeUsd,
              stop_loss_price: supabasePos.stop_loss_price,
              take_profit_price: supabasePos.take_profit_price,
              stop_loss_percent: supabasePos.stop_loss_percent,
              take_profit_percent: supabasePos.take_profit_percent,
              pnl_usd: parseFloat(pnlUsd.toFixed(2)),
              pnl_percent: parseFloat(pnlPercent.toFixed(2)),
              is_winner: pnlUsd > 0,
              exit_reason: 'Position closed (detected by sync)',
              notes: 'Auto-synced from closed position'
            }
            
            closedTrades.push(tradeData)
            console.log('Trade Sync: Found closed position:', supabasePos.symbol, {
              exchange: exchange,
              asset_class: assetClass,
              entry_price: entryPrice,
              exit_price: exitPrice,
              quantity: quantity,
              pnl_usd: pnlUsd,
              pnl_percent: pnlPercent,
              side: supabasePos.side
            })
          } else {
            console.log('Trade Sync: Skipping position without P&L data:', supabasePos.symbol)
          }
        } else {
          console.log('Trade Sync: Trade already exists for position:', supabasePos.symbol)
        }
      }
    }
    
    // Save closed trades
    if (closedTrades.length > 0) {
      console.log('Trade Sync: Saving', closedTrades.length, 'closed trades...')
      const savedTrades: any[] = []
      
      for (const tradeData of closedTrades) {
        try {
          const savedTrade = await saveTrade(tradeData)
          if (savedTrade) {
            savedTrades.push(savedTrade)
          }
        } catch (error) {
          console.error('Trade Sync: Error saving trade:', error)
        }
      }
      
      return {
        success: true,
        message: `Synced ${savedTrades.length} closed trades`,
        trades: savedTrades,
        count: savedTrades.length
      }
    } else {
      return {
        success: true,
        message: 'No closed positions found',
        trades: [],
        count: 0
      }
    }
    
  } catch (error) {
    console.error('Trade Sync: Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Error syncing trades'
    }
  }
})

