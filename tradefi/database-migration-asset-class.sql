-- Database Migration: Add asset_class column to trades and positions tables
-- Created: October 20, 2025
-- Purpose: Support multi-asset class trading (Forex, Crypto, Options)

-- Step 1: Create ENUM type for asset_class
DO $$ BEGIN
    CREATE TYPE asset_class_type AS ENUM ('forex', 'crypto', 'options');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add asset_class column to positions table
ALTER TABLE positions 
ADD COLUMN IF NOT EXISTS asset_class asset_class_type;

-- Step 3: Add asset_class column to trades table
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS asset_class asset_class_type;

-- Step 4: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_positions_asset_class ON positions(asset_class);
CREATE INDEX IF NOT EXISTS idx_trades_asset_class ON trades(asset_class);

-- Step 5: Set default values based on symbol patterns (optional - customize as needed)
-- This helps migrate existing data

-- Crypto: symbols ending with USDT, USD, BTC, ETH
UPDATE positions 
SET asset_class = 'crypto'
WHERE asset_class IS NULL 
  AND (symbol LIKE '%USDT' OR symbol LIKE '%USD' OR symbol LIKE 'BTC%' OR symbol LIKE 'ETH%' OR symbol LIKE 'SOL%');

UPDATE trades 
SET asset_class = 'crypto'
WHERE asset_class IS NULL 
  AND (symbol LIKE '%USDT' OR symbol LIKE '%USD' OR symbol LIKE 'BTC%' OR symbol LIKE 'ETH%' OR symbol LIKE 'SOL%');

-- Forex: common forex pairs (EUR, GBP, JPY, etc.)
UPDATE positions 
SET asset_class = 'forex'
WHERE asset_class IS NULL 
  AND (symbol LIKE 'EUR%' OR symbol LIKE 'GBP%' OR symbol LIKE 'USD/%' OR symbol LIKE '%/JPY' OR symbol LIKE '%/CHF');

UPDATE trades 
SET asset_class = 'forex'
WHERE asset_class IS NULL 
  AND (symbol LIKE 'EUR%' OR symbol LIKE 'GBP%' OR symbol LIKE 'USD/%' OR symbol LIKE '%/JPY' OR symbol LIKE '%/CHF');

-- Options: typically have dates or strike prices in symbol
-- Note: Customize this based on your options symbol format
UPDATE positions 
SET asset_class = 'options'
WHERE asset_class IS NULL 
  AND (symbol ~ '\d{6}[CP]\d+' OR symbol LIKE '%C%' OR symbol LIKE '%P%');

UPDATE trades 
SET asset_class = 'options'
WHERE asset_class IS NULL 
  AND (symbol ~ '\d{6}[CP]\d+' OR symbol LIKE '%C%' OR symbol LIKE '%P%');

-- Step 6: Verify migration
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
ORDER BY table_name, asset_class;

-- Notes:
-- 1. Run this migration in your Supabase SQL Editor
-- 2. The asset_class column is nullable to support gradual migration
-- 3. Update your bot(s) to set asset_class when creating new positions/trades
-- 4. You can customize the symbol pattern matching logic in Step 5
-- 5. For new positions/trades, make sure your bot sends the asset_class field

COMMENT ON COLUMN positions.asset_class IS 'Asset class: forex, crypto, or options';
COMMENT ON COLUMN trades.asset_class IS 'Asset class: forex, crypto, or options';

