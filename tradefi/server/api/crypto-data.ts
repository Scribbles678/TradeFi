import { defineEventHandler } from '#imports'

export default defineEventHandler(async (event): Promise<any> => {
  try {
    // Get Aster DEX positions
    const positionsResponse = await $fetch('/api/balance/aster-positions');
    console.log('Crypto-data: Aster positions response:', positionsResponse);
    const asterPositions = positionsResponse.success ? positionsResponse.positions : [];
    console.log('Crypto-data: Aster positions count:', asterPositions.length);

    // Get Aster DEX balance for today's P&L calculation
    const balanceResponse = await $fetch('/api/balance/aster');
    const currentBalance = balanceResponse.success ? balanceResponse.balance : 0;

    // For now, we'll use a simple approach:
    // - Calculate unrealized P&L from positions
    // - Use positions as "trades" for the chart
    const totalUnrealizedPnL = asterPositions.reduce((sum: number, pos: any) => 
      sum + (pos.unrealized_pnl_usd || 0), 0
    );

    // Create mock trade data from positions for chart
    const mockTrades = asterPositions.map((pos: any, index: number) => ({
      id: `aster_${pos.id}`,
      symbol: pos.symbol,
      side: pos.side,
      entry_price: pos.entry_price,
      current_price: pos.current_price,
      quantity: pos.quantity,
      pnl_usd: pos.unrealized_pnl_usd,
      is_winner: pos.unrealized_pnl_usd > 0,
      exit_time: new Date().toISOString(),
      exchange: 'aster',
      asset_class: 'crypto'
    }));

    // Calculate today's stats
    const todayPnL = totalUnrealizedPnL;
    const winners = mockTrades.filter(t => t.is_winner).length;
    const winRate = mockTrades.length > 0 ? (winners / mockTrades.length) * 100 : 0;

    // Create cumulative P&L data for chart
    const cumulativeData = mockTrades.map((trade, index) => ({
      date: new Date().toLocaleDateString(),
      cumulative_pnl: trade.pnl_usd
    }));

    return {
      success: true,
      positions: asterPositions,
      trades: mockTrades,
      stats: {
        todayPnL: parseFloat(todayPnL.toFixed(2)),
        winRate: parseFloat(winRate.toFixed(2)),
        totalTrades: mockTrades.length,
      },
      chartData: cumulativeData,
      balance: currentBalance
    };
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return {
      success: false,
      positions: [],
      trades: [],
      stats: {
        todayPnL: 0,
        winRate: 0,
        totalTrades: 0,
      },
      chartData: [],
      balance: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});
