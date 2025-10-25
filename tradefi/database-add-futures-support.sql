-- Database Migration: Add futures support to TradeFI
-- Created: December 2024
-- Purpose: Add futures asset class and Tasty Trade exchange support

-- Step 1: Add 'futures' to the existing asset_class_type enum
DO $$ BEGIN
    ALTER TYPE asset_class_type ADD VALUE IF NOT EXISTS 'futures';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add 'tastytrade' to exchange column values (if needed)
-- Note: The exchange column is TEXT, so no enum modification needed

-- Step 3: Update existing records to support futures (optional)
-- This helps migrate any existing data that might be futures-related
UPDATE positions 
SET asset_class = 'futures'
WHERE asset_class IS NULL 
  AND (symbol LIKE '%/ES%' OR symbol LIKE '%/NQ%' OR symbol LIKE '%/YM%' OR symbol LIKE '%/RTY%' OR symbol LIKE '%/GC%' OR symbol LIKE '%/CL%');

UPDATE trades 
SET asset_class = 'futures'
WHERE asset_class IS NULL 
  AND (symbol LIKE '%/ES%' OR symbol LIKE '%/NQ%' OR symbol LIKE '%/YM%' OR symbol LIKE '%/RTY%' OR symbol LIKE '%/GC%' OR symbol LIKE '%/CL%');

-- Step 4: Update strategies table to support futures
-- Add futures to the asset_class column in strategies table
UPDATE strategies 
SET asset_class = 'futures'
WHERE asset_class IS NULL 
  AND (name ILIKE '%futures%' OR name ILIKE '%es%' OR name ILIKE '%nq%' OR name ILIKE '%ym%');

-- Step 5: Create index for futures queries (if not exists)
CREATE INDEX IF NOT EXISTS idx_positions_asset_class_futures ON positions(asset_class) WHERE asset_class = 'futures';
CREATE INDEX IF NOT EXISTS idx_trades_asset_class_futures ON trades(asset_class) WHERE asset_class = 'futures';
CREATE INDEX IF NOT EXISTS idx_strategies_asset_class_futures ON strategies(asset_class) WHERE asset_class = 'futures';

-- Step 6: Add sample futures strategy (optional)
INSERT INTO strategies (name, description, asset_class, status, risk_level, success_rate, avg_profit, total_trades, winning_trades, losing_trades, timeframe, pine_script) VALUES
('ES Scalping Strategy', 'Quick scalping strategy for E-mini S&P 500 futures during market hours.', 'futures', 'inactive', 'high', 68.00, 2.50, 50, 34, 16, '1m', '// @version=5
strategy("ES Scalping Strategy", overlay=true)

// ES futures scalping strategy
fastMA = ta.sma(close, 5)
slowMA = ta.sma(close, 20)
rsi = ta.rsi(close, 14)

// Entry conditions
longCondition = ta.crossover(fastMA, slowMA) and rsi < 70
shortCondition = ta.crossunder(fastMA, slowMA) and rsi > 30

if (longCondition)
    strategy.entry("Long", strategy.long)
if (shortCondition)
    strategy.entry("Short", strategy.short)

plot(fastMA, color=color.blue)
plot(slowMA, color=color.red)')
ON CONFLICT (name) DO NOTHING;

-- Step 7: Verify the migration
SELECT 
  'positions' as table_name,
  asset_class,
  COUNT(*) as count
FROM positions
GROUP BY asset_class
UNION ALL
SELECT 
  'trades' as table_name,
  asset_class,
  COUNT(*) as count
FROM trades
GROUP BY asset_class
UNION ALL
SELECT 
  'strategies' as table_name,
  asset_class,
  COUNT(*) as count
FROM strategies
GROUP BY asset_class
ORDER BY table_name, asset_class;

-- Step 8: Add comments
COMMENT ON COLUMN positions.asset_class IS 'Asset class: forex, crypto, options, stocks, or futures';
COMMENT ON COLUMN trades.asset_class IS 'Asset class: forex, crypto, options, stocks, or futures';
COMMENT ON COLUMN strategies.asset_class IS 'Asset class: forex, crypto, options, stocks, or futures';

-- Notes:
-- 1. Run this migration in your Supabase SQL Editor
-- 2. The futures asset class is now supported across all tables
-- 3. Tasty Trade exchange can be used with 'tastytrade' value
-- 4. Update your bot(s) to set asset_class='futures' and exchange='tastytrade' for futures trades
-- 5. The sample strategy shows how to create futures-specific strategies
