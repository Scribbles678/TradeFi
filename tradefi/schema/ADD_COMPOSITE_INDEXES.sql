-- =====================================================
-- PERFORMANCE: Add Composite Indexes
-- =====================================================
-- These indexes improve query performance for common patterns
-- Run this in Supabase SQL Editor

-- Trades table composite indexes
CREATE INDEX IF NOT EXISTS idx_trades_user_id_created_at 
ON public.trades(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trades_user_id_asset_class 
ON public.trades(user_id, asset_class);

CREATE INDEX IF NOT EXISTS idx_trades_user_id_exchange 
ON public.trades(user_id, exchange);

-- Strategies table composite indexes
CREATE INDEX IF NOT EXISTS idx_strategies_user_id_status 
ON public.strategies(user_id, status);

CREATE INDEX IF NOT EXISTS idx_strategies_user_id_asset_class 
ON public.strategies(user_id, asset_class);

-- Positions table composite indexes
CREATE INDEX IF NOT EXISTS idx_positions_user_id_exchange 
ON public.positions(user_id, exchange);

CREATE INDEX IF NOT EXISTS idx_positions_user_id_asset_class 
ON public.positions(user_id, asset_class);

-- Bot credentials composite index (already exists, but good to verify)
CREATE INDEX IF NOT EXISTS idx_bot_credentials_user_exchange_env 
ON public.bot_credentials(user_id, exchange, environment);

