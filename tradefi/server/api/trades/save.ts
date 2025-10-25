import { saveTrade, saveTrades, Trade } from '~/utils/supabase';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    // Handle single trade
    if (body.symbol) {
      console.log('Saving single trade:', body.symbol);
      
      const tradeData: Partial<Trade> = {
        symbol: body.symbol,
        side: body.side, // 'BUY' or 'SELL'
        asset_class: body.asset_class || 'crypto', // Default to crypto
        exchange: body.exchange || 'aster', // Default to aster for crypto
        entry_price: body.entry_price,
        entry_time: body.entry_time,
        exit_price: body.exit_price,
        exit_time: body.exit_time,
        quantity: body.quantity,
        position_size_usd: body.position_size_usd,
        stop_loss_price: body.stop_loss_price || null,
        take_profit_price: body.take_profit_price || null,
        stop_loss_percent: body.stop_loss_percent || null,
        take_profit_percent: body.take_profit_percent || null,
        pnl_usd: body.pnl_usd,
        pnl_percent: body.pnl_percent,
        is_winner: body.is_winner,
        exit_reason: body.exit_reason || null,
        order_id: body.order_id || null,
        notes: body.notes || null
      };

      const savedTrade = await saveTrade(tradeData);
      
      if (savedTrade) {
        return {
          success: true,
          trade: savedTrade,
          message: 'Trade saved successfully'
        };
      } else {
        return {
          success: false,
          error: 'Failed to save trade'
        };
      }
    }
    
    // Handle multiple trades
    if (Array.isArray(body)) {
      console.log(`Saving ${body.length} trades`);
      
      const tradesData: Partial<Trade>[] = body.map(trade => ({
        symbol: trade.symbol,
        side: trade.side,
        asset_class: trade.asset_class || 'crypto',
        exchange: trade.exchange || 'aster',
        entry_price: trade.entry_price,
        entry_time: trade.entry_time,
        exit_price: trade.exit_price,
        exit_time: trade.exit_time,
        quantity: trade.quantity,
        position_size_usd: trade.position_size_usd,
        stop_loss_price: trade.stop_loss_price || null,
        take_profit_price: trade.take_profit_price || null,
        stop_loss_percent: trade.stop_loss_percent || null,
        take_profit_percent: trade.take_profit_percent || null,
        pnl_usd: trade.pnl_usd,
        pnl_percent: trade.pnl_percent,
        is_winner: trade.is_winner,
        exit_reason: trade.exit_reason || null,
        order_id: trade.order_id || null,
        notes: trade.notes || null
      }));

      const savedTrades = await saveTrades(tradesData);
      
      if (savedTrades) {
        return {
          success: true,
          trades: savedTrades,
          count: savedTrades.length,
          message: `${savedTrades.length} trades saved successfully`
        };
      } else {
        return {
          success: false,
          error: 'Failed to save trades'
        };
      }
    }

    return {
      success: false,
      error: 'Invalid request format. Expected single trade object or array of trades.'
    };

  } catch (error) {
    console.error('Error in /api/trades/save:', error);
    return {
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});
