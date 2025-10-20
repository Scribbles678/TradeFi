/**
 * Supabase Client for TradeFI Dashboard
 * Read-only access to Sparky trading data
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yfzfdvghkhctzqjtwajy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmemZkdmdoa2hjdHpxanR3YWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTI0NjUsImV4cCI6MjA3NjQ2ODQ2NX0.CpOU5V-kkzHQA4Z-hQ51rXQlyPlQHaRQHynAU6E6UiU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Asset Class Type
export type AssetClass = 'forex' | 'crypto' | 'options';

// Types for database tables
export interface Trade {
  id: string;
  created_at: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  asset_class: AssetClass | null;
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

/**
 * Fetch all open positions
 */
export async function getOpenPositions(assetClass?: AssetClass): Promise<Position[]> {
  let query = supabase
    .from('positions')
    .select('*');

  if (assetClass) {
    query = query.eq('asset_class', assetClass);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching positions:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch recent trades (limit 20 by default)
 */
export async function getRecentTrades(limit = 20, assetClass?: AssetClass): Promise<Trade[]> {
  let query = supabase
    .from('trades')
    .select('*');

  if (assetClass) {
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
 * Fetch trades for a specific date range
 */
export async function getTradesByDateRange(startDate: string, endDate: string): Promise<Trade[]> {
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
 * Fetch today's trades
 */
export async function getTodaysTrades(assetClass?: AssetClass): Promise<Trade[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
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
 */
export async function getCumulativePnL(days = 30, assetClass?: AssetClass): Promise<Array<{ date: string; cumulative_pnl: number }>> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let query = supabase
    .from('trades')
    .select('exit_time, pnl_usd')
    .gte('exit_time', startDate.toISOString());

  if (assetClass) {
    query = query.eq('asset_class', assetClass);
  }

  const { data, error } = await query.order('exit_time', { ascending: true });

  if (error) {
    console.error('Error fetching cumulative P&L:', error);
    return [];
  }

  if (!data || data.length === 0) return [];

  // Calculate cumulative P&L
  let cumulative = 0;
  const result = data.map(trade => {
    cumulative += trade.pnl_usd;
    return {
      date: new Date(trade.exit_time).toLocaleDateString(),
      cumulative_pnl: parseFloat(cumulative.toFixed(2))
    };
  });

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

  const todayPnL = todaysTrades.reduce((sum, trade) => sum + trade.pnl_usd, 0);
  const winners = todaysTrades.filter(t => t.is_winner).length;
  const winRate = (winners / todaysTrades.length) * 100;

  return {
    todayPnL: parseFloat(todayPnL.toFixed(2)),
    winRate: parseFloat(winRate.toFixed(2)),
    totalTrades: todaysTrades.length,
  };
}

