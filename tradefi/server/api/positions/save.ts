import { savePosition, updatePosition, Position } from '~/utils/supabase';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    console.log('Saving position:', body.symbol);
    
    const positionData: Partial<Position> = {
      symbol: body.symbol,
      side: body.side, // 'BUY' or 'SELL'
      asset_class: body.asset_class || 'crypto', // Default to crypto
      exchange: body.exchange || 'aster', // Default to aster for crypto
      entry_price: body.entry_price,
      entry_time: body.entry_time,
      quantity: body.quantity,
      position_size_usd: body.position_size_usd,
      current_price: body.current_price,
      unrealized_pnl_usd: body.unrealized_pnl_usd,
      unrealized_pnl_percent: body.unrealized_pnl_percent,
      stop_loss_price: body.stop_loss_price || null,
      take_profit_price: body.take_profit_price || null,
      stop_loss_percent: body.stop_loss_percent || null,
      take_profit_percent: body.take_profit_percent || null,
      notes: body.notes || null
    };

    // If position ID is provided, update existing position
    if (body.id) {
      const updatedPosition = await updatePosition(body.id, positionData);
      
      if (updatedPosition) {
        return {
          success: true,
          position: updatedPosition,
          message: 'Position updated successfully'
        };
      } else {
        return {
          success: false,
          error: 'Failed to update position'
        };
      }
    } else {
      // Create new position
      const savedPosition = await savePosition(positionData);
      
      if (savedPosition) {
        return {
          success: true,
          position: savedPosition,
          message: 'Position saved successfully'
        };
      } else {
        return {
          success: false,
          error: 'Failed to save position'
        };
      }
    }

  } catch (error) {
    console.error('Error in /api/positions/save:', error);
    return {
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});
