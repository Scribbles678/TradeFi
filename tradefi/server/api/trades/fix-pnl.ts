import { defineEventHandler } from '#imports'
import { supabase } from '~/utils/supabase'

/**
 * Fix P&L calculation for existing trades
 * This endpoint recalculates P&L for trades that were saved with incorrect values
 * Specifically fixes OANDA forex and Aster DEX crypto trades that used wrong calculation
 */
export default defineEventHandler(async (event): Promise<any> => {
  try {
    // Get all trades from today that might have incorrect P&L
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { data: trades, error: fetchError } = await supabase
      .from('trades')
      .select('*')
      .gte('exit_time', today.toISOString())
      .order('exit_time', { ascending: false })
    
    if (fetchError) {
      console.error('Error fetching trades:', fetchError)
      return {
        success: false,
        error: fetchError.message
      }
    }
    
    if (!trades || trades.length === 0) {
      return {
        success: true,
        message: 'No trades found to fix',
        fixed: 0
      }
    }
    
    console.log('Fix P&L: Found', trades.length, 'trades to check')
    
    const fixedTrades = []
    
    for (const trade of trades) {
      const exchange = trade.exchange?.toLowerCase()
      const assetClass = trade.asset_class?.toLowerCase()
      const currentPnl = trade.pnl_usd || 0
      
      // Skip trades that seem reasonable (P&L less than $1000 in absolute value)
      if (Math.abs(currentPnl) < 1000) {
        continue
      }
      
      // For OANDA forex and Aster DEX crypto, we need to recalculate from entry/exit
      // But we don't have the original unrealized_pnl_usd anymore since the position is closed
      // So we'll use the exchange-provided calculation method
      
      let shouldFix = false
      let newPnlUsd = currentPnl
      let newPnlPercent = trade.pnl_percent || 0
      
      // Check if this is a forex trade with suspiciously large P&L
      if (exchange === 'oanda' && assetClass === 'forex') {
        // For forex, large P&L values often come from multiplying price difference by units
        // The actual P&L should be much smaller
        // We can estimate: for forex, P&L per pip is roughly units / 10000 for most pairs
        // A typical small loss would be maybe $1-10, not $10,000
        
        const entryPrice = trade.entry_price
        const exitPrice = trade.exit_price
        const quantity = trade.quantity || 0
        const positionSizeUsd = trade.position_size_usd || 0
        
        if (entryPrice && exitPrice && quantity > 0) {
          // Calculate what the P&L should be
          // For forex: approximate P&L = (exit_price - entry_price) * quantity / pip_value_factor
          // For most pairs, pip value is around 0.0001 for price change = 1 pip
          // But OANDA gives us unrealized_pnl_usd which is more accurate
          
          // Since we don't have the original unrealized_pnl, we'll estimate
          // Price difference in pips: (exit - entry) * 10000 (for pairs like EUR/USD)
          // P&L estimate: pip_difference * (quantity / 10000) for most pairs
          
          const priceDiff = exitPrice - entryPrice
          const pipDiff = priceDiff * 10000 // Convert to pips (rough approximation)
          
          // Estimate P&L: pip difference * (units / 10000) for standard lots
          // But this is still an approximation - the real issue is the trade was saved wrong
          
          // Actually, let's just flag it for manual review if it's over $1000
          shouldFix = true
          
          // For now, set P&L to 0 and add a note - user should manually correct
          // Or we could try to estimate from position size
          if (positionSizeUsd > 0) {
            // If position size is around $10,000 and we have a $10,000 loss,
            // that's a 100% loss which is unlikely
            // More likely: the position size was used as P&L incorrectly
            // Or the quantity * price_diff was calculated wrong
            
            // Try to estimate: if exit_price is close to entry_price, P&L should be small
            const priceDiffPercent = Math.abs((exitPrice - entryPrice) / entryPrice) * 100
            if (priceDiffPercent < 1) { // Less than 1% price change
              // P&L should be roughly: position_size * price_diff_percent
              newPnlUsd = (trade.side === 'BUY' ? 1 : -1) * positionSizeUsd * (priceDiffPercent / 100)
              newPnlPercent = (trade.side === 'BUY' ? 1 : -1) * priceDiffPercent
              
              console.log(`Fix P&L: Recalculating ${trade.symbol} P&L:`, {
                entry_price: entryPrice,
                exit_price: exitPrice,
                quantity: quantity,
                position_size_usd: positionSizeUsd,
                price_diff_percent: priceDiffPercent,
                old_pnl: currentPnl,
                new_pnl: newPnlUsd
              })
            } else {
              // Price changed more than 1%, but P&L is still suspicious
              // Mark for manual review
              shouldFix = false
              console.warn(`Fix P&L: ${trade.symbol} has large price change (${priceDiffPercent.toFixed(2)}%) but suspicious P&L. Manual review needed.`)
            }
          }
        }
      }
      
      // For crypto trades with suspicious P&L
      if (exchange === 'aster' && assetClass === 'crypto') {
        // Similar logic for crypto
        const entryPrice = trade.entry_price
        const exitPrice = trade.exit_price
        const quantity = trade.quantity || 0
        const positionSizeUsd = trade.position_size_usd || 0
        
        if (entryPrice && exitPrice && quantity > 0 && Math.abs(currentPnl) > positionSizeUsd) {
          // P&L can't be larger than position size for a total loss
          shouldFix = true
          
          const priceDiffPercent = Math.abs((exitPrice - entryPrice) / entryPrice) * 100
          if (positionSizeUsd > 0) {
            newPnlUsd = (trade.side === 'BUY' ? 1 : -1) * positionSizeUsd * (priceDiffPercent / 100)
            newPnlPercent = (trade.side === 'BUY' ? 1 : -1) * priceDiffPercent
            
            console.log(`Fix P&L: Recalculating ${trade.symbol} P&L:`, {
              entry_price: entryPrice,
              exit_price: exitPrice,
              quantity: quantity,
              position_size_usd: positionSizeUsd,
              price_diff_percent: priceDiffPercent,
              old_pnl: currentPnl,
              new_pnl: newPnlUsd
            })
          }
        }
      }
      
      if (shouldFix) {
        // Update the trade
        const { error: updateError } = await supabase
          .from('trades')
          .update({
            pnl_usd: parseFloat(newPnlUsd.toFixed(2)),
            pnl_percent: parseFloat(newPnlPercent.toFixed(2)),
            is_winner: newPnlUsd > 0,
            notes: (trade.notes || '') + ` [P&L recalculated on ${new Date().toISOString()}]`
          })
          .eq('id', trade.id)
        
        if (updateError) {
          console.error(`Fix P&L: Error updating trade ${trade.id}:`, updateError)
        } else {
          fixedTrades.push({
            id: trade.id,
            symbol: trade.symbol,
            old_pnl: currentPnl,
            new_pnl: newPnlUsd
          })
          console.log(`Fix P&L: Fixed trade ${trade.symbol}: $${currentPnl} -> $${newPnlUsd}`)
        }
      }
    }
    
    return {
      success: true,
      message: `Fixed ${fixedTrades.length} trades`,
      fixed: fixedTrades.length,
      trades: fixedTrades
    }
  } catch (error) {
    console.error('Fix P&L: Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
})

