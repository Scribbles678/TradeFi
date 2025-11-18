/**
 * Supabase Client helpers for TradeFI Dashboard
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useRuntimeConfig } from '#imports';

let supabaseClient: SupabaseClient | null = null;
let serviceSupabaseClient: SupabaseClient | null = null;

function assertSupabaseEnv(url?: string, key?: string) {
  if (!url || !key) {
    throw new Error(
      'Supabase environment variables are missing. Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set.'
    );
  }
}

export function useSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const config = useRuntimeConfig();
  const url = config.public.supabaseUrl;
  const key = config.public.supabaseKey;
  assertSupabaseEnv(url, key);

  supabaseClient = createClient(url as string, key as string);
  return supabaseClient;
}

export function useServiceSupabaseClient(): SupabaseClient {
  if (import.meta.client) {
    throw new Error('The Supabase service role client can only be used server-side.');
  }

  if (serviceSupabaseClient) {
    return serviceSupabaseClient;
  }

  const config = useRuntimeConfig();
  const url = config.public.supabaseUrl;
  const key = config.supabaseServiceRoleKey;

  if (!url || !key) {
    throw new Error(
      'Supabase service role configuration is missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.'
    );
  }

  serviceSupabaseClient = createClient(url as string, key as string);
  return serviceSupabaseClient;
}

// Asset Class Type
export type AssetClass = 'forex' | 'crypto' | 'options' | 'stocks' | 'futures';
export type Exchange = 'aster' | 'oanda' | 'tradier' | 'tastytrade';

// Exchange to Asset Class mapping
export const exchangeToAssetClass: Record<Exchange, AssetClass[]> = {
  'aster': ['crypto'],
  'oanda': ['forex'],
  'tradier': ['options', 'stocks'],
  'tastytrade': ['futures']
};

export const assetClassToExchange: Record<AssetClass, Exchange> = {
  'crypto': 'aster',
  'forex': 'oanda',
  'options': 'tradier',
  'stocks': 'tradier',
  'futures': 'tastytrade'
};

// Types for database tables
export interface Trade {
  id: string;
  created_at: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  asset_class: AssetClass | null;
  exchange: Exchange | null;
  entry_price: number;
  entry_time: string;
  exit_price: number;
  exit_time: string;
  quantity: number;
  position_size_usd: number;
  stop_loss_price: number | null;
  take_profit_price: number | null;
  stop_loss_percent: number | null;
  take_profit_percent: number | null;
  pnl_usd: number;
  pnl_percent: number;
  is_winner: boolean;
  exit_reason: string | null;
  order_id: string | null;
  notes: string | null;
}

export interface Position {
  id: string;
  created_at: string;
  updated_at: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  asset_class: AssetClass | null;
  exchange: Exchange | null;
  entry_price: number;
  entry_time: string;
  quantity: number;
  position_size_usd: number;
  stop_loss_price: number | null;
  take_profit_price: number | null;
  stop_loss_percent: number | null;
  take_profit_percent: number | null;
  entry_order_id: string | null;
  stop_loss_order_id: string | null;
  take_profit_order_id: string | null;
  current_price: number | null;
  unrealized_pnl_usd: number | null;
  unrealized_pnl_percent: number | null;
  last_price_update: string | null;
  notes: string | null;
}

export interface TradeStats {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate_percent: number;
  total_pnl_usd: number;
  avg_pnl_per_trade: number;
  largest_win: number;
  largest_loss: number;
  avg_win: number;
  avg_loss: number;
}

export interface Strategy {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
  asset_class: AssetClass | null;
  status: 'active' | 'inactive' | 'testing';
  pine_script: string | null;
  pine_script_version: string | null;
  success_rate: number | null;
  avg_profit: number | null;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  risk_level: 'low' | 'medium' | 'high' | null;
  max_position_size_usd: number | null;
  stop_loss_percent: number | null;
  take_profit_percent: number | null;
  timeframe: string | null;
  symbols: string[] | null;
  webhook_secret: string | null;
  notes: string | null;
}

/**
 * Fetch all open positions
 * Filters by exchange (aster, oanda, tradier) or asset_class (crypto, forex, options)
 */
/**
 * Fetch open positions (user-specific via RLS)
 */
export async function getOpenPositions(assetClass?: AssetClass): Promise<Position[]> {
  const supabase = useSupabaseClient();
  
  // RLS policies will automatically filter by user_id
  let query = supabase
    .from('positions')
    .select('*');

  if (assetClass) {
    query = query.eq('asset_class', assetClass);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  // Debug logging to see what's in the database
  console.log('Supabase Positions Query:', {
    assetClass,
    dataCount: data?.length || 0,
    error: error?.message || 'none'
  });

  if (error) {
    console.error('Error fetching positions:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch recent trades (limit 20 by default)
 * Filters by exchange (aster, oanda, tradier) or asset_class (crypto, forex, options)
 */
export async function getRecentTrades(limit = 20, assetClass?: AssetClass): Promise<Trade[]> {
  const supabase = useSupabaseClient();
  let query = supabase
    .from('trades')
    .select('*');

  if (assetClass) {
    // For now, use asset_class filtering since exchange column might not be set for existing data
    query = query.eq('asset_class', assetClass);
  }

  const { data, error } = await query
    .order('exit_time', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching trades:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch trades for a specific date range (user-specific via RLS)
 */
export async function getTradesByDateRange(startDate: string, endDate: string): Promise<Trade[]> {
  const supabase = useSupabaseClient();
  
  // RLS policies will automatically filter by user_id
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .gte('exit_time', startDate)
    .lte('exit_time', endDate)
    .order('exit_time', { ascending: false });

  if (error) {
    console.error('Error fetching trades by date range:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch today's trades (user-specific via RLS)
 * Filters by exchange (aster, oanda, tradier) or asset_class (crypto, forex, options)
 */
export async function getTodaysTrades(assetClass?: AssetClass): Promise<Trade[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const supabase = useSupabaseClient();
  
  // RLS policies will automatically filter by user_id
  let query = supabase
    .from('trades')
    .select('*')
    .gte('exit_time', today.toISOString());

  if (assetClass) {
    query = query.eq('asset_class', assetClass);
  }

  const { data, error } = await query.order('exit_time', { ascending: false });

  if (error) {
    console.error('Error fetching today\'s trades:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch overall trading statistics
 */
export async function getTradeStats(): Promise<TradeStats | null> {
  const supabase = useSupabaseClient();
  const { data, error } = await supabase
    .from('trade_stats')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching trade stats:', error);
    return null;
  }

  return data;
}

/**
 * Calculate cumulative P&L over time for chart
 * Filters by exchange (aster, oanda, tradier) or asset_class (crypto, forex, options)
 */
export async function getCumulativePnL(days = 30, assetClass?: AssetClass): Promise<Array<{ date: string; cumulative_pnl: number }>> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  console.log('Supabase: Fetching cumulative P&L for', days, 'days', assetClass ? `(filter: ${assetClass})` : '(all asset classes)');
  console.log('Supabase: Start date:', startDate.toISOString());

  const supabase = useSupabaseClient();
  let query = supabase
    .from('trades')
    .select('exit_time, pnl_usd, symbol, asset_class, exchange')
    .gte('exit_time', startDate.toISOString());

  if (assetClass) {
    // For now, use asset_class filtering since exchange column might not be set for existing data
    query = query.eq('asset_class', assetClass);
    console.log('Supabase: Filtering by asset_class:', assetClass);
  }

  const { data, error } = await query.order('exit_time', { ascending: true });

  if (error) {
    console.error('Supabase: Error fetching cumulative P&L:', error);
    return [];
  }

  console.log('Supabase: Found', data?.length || 0, 'trades in the last', days, 'days');
  if (data && data.length > 0) {
    console.log('Supabase: Trades data:', data.map(t => ({
      symbol: t.symbol,
      exit_time: t.exit_time,
      pnl_usd: t.pnl_usd,
      asset_class: t.asset_class,
      exchange: t.exchange
    })));
  }

  if (!data || data.length === 0) {
    console.log('Supabase: No trades found - chart will show empty state');
    return [];
  }

  // Calculate cumulative P&L
  let cumulative = 0;
  const result = data.map(trade => {
    cumulative += trade.pnl_usd || 0;
    return {
      date: new Date(trade.exit_time).toLocaleDateString(),
      cumulative_pnl: parseFloat(cumulative.toFixed(2))
    };
  });

  console.log('Supabase: Cumulative P&L result:', result);
  console.log('Supabase: Final cumulative P&L:', result[result.length - 1]?.cumulative_pnl);

  return result;
}

/**
 * Get today's statistics
 */
export async function getTodaysStats(assetClass?: AssetClass) {
  const todaysTrades = await getTodaysTrades(assetClass);
  
  if (todaysTrades.length === 0) {
    return {
      todayPnL: 0,
      winRate: 0,
      totalTrades: 0,
    };
  }

  // Log today's trades for debugging
  console.log('Supabase: Today\'s trades for stats:', todaysTrades.map(t => ({
    id: t.id,
    symbol: t.symbol,
    pnl_usd: t.pnl_usd,
    entry_price: t.entry_price,
    exit_price: t.exit_price,
    quantity: t.quantity,
    side: t.side,
    exchange: t.exchange,
    asset_class: t.asset_class,
    position_size_usd: t.position_size_usd,
    exit_time: t.exit_time,
    notes: t.notes
  })));
  
  // Log trades with suspiciously large P&L values
  const suspiciousTrades = todaysTrades.filter(t => Math.abs(t.pnl_usd || 0) > 1000);
  if (suspiciousTrades.length > 0) {
    console.warn('Supabase: Found trades with suspiciously large P&L values:', suspiciousTrades.map(t => ({
      id: t.id,
      symbol: t.symbol,
      pnl_usd: t.pnl_usd,
      entry_price: t.entry_price,
      exit_price: t.exit_price,
      quantity: t.quantity,
      position_size_usd: t.position_size_usd,
      exchange: t.exchange,
      notes: t.notes,
      // Calculate what the P&L should be based on entry/exit
      calculated_pnl: t.entry_price && t.exit_price && t.quantity ? 
        (t.side === 'BUY' ? (t.exit_price - t.entry_price) * t.quantity : (t.entry_price - t.exit_price) * t.quantity) : 
        'N/A'
    })));
  }

  const todayPnL = todaysTrades.reduce((sum, trade) => {
    const pnl = trade.pnl_usd || 0;
    console.log(`Supabase: Adding trade ${trade.symbol} P&L: $${pnl} (total so far: ${sum + pnl})`);
    return sum + pnl;
  }, 0);
  
  const winners = todaysTrades.filter(t => t.is_winner).length;
  const winRate = (winners / todaysTrades.length) * 100;

  console.log('Supabase: Today\'s stats calculated:', {
    todayPnL,
    winRate,
    totalTrades: todaysTrades.length,
    winners
  });

  return {
    todayPnL: parseFloat(todayPnL.toFixed(2)),
    winRate: parseFloat(winRate.toFixed(2)),
    totalTrades: todaysTrades.length,
  };
}

/**
 * =======================
 * STRATEGIES FUNCTIONS
 * =======================
 */

/**
 * Fetch all strategies (user-specific via RLS)
 */
export async function getStrategies(assetClass?: AssetClass): Promise<Strategy[]> {
  const supabase = useSupabaseClient();
  let query = supabase
    .from('strategies')
    .select('*');

  if (assetClass) {
    query = query.eq('asset_class', assetClass);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching strategies:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch a single strategy by ID (user-specific via RLS)
 */
export async function getStrategy(id: string): Promise<Strategy | null> {
  const supabase = useSupabaseClient();
  const { data, error } = await supabase
    .from('strategies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching strategy:', error);
    return null;
  }

  return data;
}

/**
 * Create a new strategy (user_id auto-assigned via RLS)
 */
export async function createStrategy(strategy: Partial<Strategy>): Promise<Strategy | null> {
  const supabase = useSupabaseClient();
  const { data, error } = await supabase
    .from('strategies')
    .insert([strategy])
    .select()
    .single();

  if (error) {
    console.error('Error creating strategy:', error);
    return null;
  }

  return data;
}

/**
 * Update a strategy (user-specific via RLS)
 */
export async function updateStrategy(id: string, updates: Partial<Strategy>): Promise<Strategy | null> {
  const supabase = useSupabaseClient();
  const { data, error } = await supabase
    .from('strategies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating strategy:', error);
    return null;
  }

  return data;
}

/**
 * Save a trade to the database
 */
export async function saveTrade(trade: Partial<Trade>): Promise<Trade | null> {
  const supabase = useServiceSupabaseClient();
  const { data, error } = await supabase
    .from('trades')
    .insert([trade])
    .select()
    .single();

  if (error) {
    console.error('Error saving trade:', error);
    return null;
  }

  console.log('Trade saved successfully:', data);
  return data;
}

/**
 * Save multiple trades to the database
 */
export async function saveTrades(trades: Partial<Trade>[]): Promise<Trade[] | null> {
  const supabase = useServiceSupabaseClient();
  const { data, error } = await supabase
    .from('trades')
    .insert(trades)
    .select();

  if (error) {
    console.error('Error saving trades:', error);
    return null;
  }

  console.log(`${trades.length} trades saved successfully`);
  return data;
}

/**
 * Save a position to the database
 */
export async function savePosition(position: Partial<Position>): Promise<Position | null> {
  const supabase = useServiceSupabaseClient();
  const { data, error } = await supabase
    .from('positions')
    .insert([position])
    .select()
    .single();

  if (error) {
    console.error('Error saving position:', error);
    return null;
  }

  console.log('Position saved successfully:', data);
  return data;
}

/**
 * Update an existing position
 */
export async function updatePosition(id: string, updates: Partial<Position>): Promise<Position | null> {
  const supabase = useServiceSupabaseClient();
  const { data, error } = await supabase
    .from('positions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating position:', error);
    return null;
  }

  return data;
}

/**
 * Update Pine Script for a strategy
 */
export async function updateStrategyPineScript(id: string, pineScript: string, version: string = 'v5'): Promise<boolean> {
  const supabase = useSupabaseClient();
  const { error } = await supabase
    .from('strategies')
    .update({ 
      pine_script: pineScript,
      pine_script_version: version
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating Pine Script:', error);
    return false;
  }

  return true;
}

/**
 * Delete a strategy (user-specific via RLS)
 */
export async function deleteStrategy(id: string): Promise<boolean> {
  console.log('Deleting strategy with ID:', id);
  
  const supabase = useSupabaseClient();
  const { data, error } = await supabase
    .from('strategies')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error deleting strategy:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    return false;
  }

  console.log('Strategy deleted successfully:', data);
  return true;
}

/**
 * Get total P&L for a specific strategy from trades (user-specific via RLS)
 */
export async function getStrategyPnL(strategyId: string): Promise<number> {
  const supabase = useSupabaseClient();
  const { data, error } = await supabase
    .from('trades')
    .select('pnl_usd')
    .eq('strategy_id', strategyId);

  if (error) {
    console.error('Error fetching strategy P&L:', error);
    return 0;
  }

  if (!data || data.length === 0) {
    return 0;
  }

  const totalPnL = data.reduce((sum, trade) => {
    return sum + (trade.pnl_usd || 0);
  }, 0);

  return parseFloat(totalPnL.toFixed(2));
}

/**
 * Toggle strategy status (active/inactive) (user-specific via RLS)
 */
export async function toggleStrategyStatus(id: string): Promise<Strategy | null> {
  // First get the current strategy
  const strategy = await getStrategy(id);
  if (!strategy) return null;

  // Toggle status
  const newStatus = strategy.status === 'active' ? 'inactive' : 'active';

  return await updateStrategy(id, { status: newStatus });
}

