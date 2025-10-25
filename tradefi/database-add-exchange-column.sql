-- Add exchange column to trades and positions tables
-- This is needed for the dashboard filtering to work properly

-- Add exchange column to trades table
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS exchange TEXT;

-- Add exchange column to positions table  
ALTER TABLE positions 
ADD COLUMN IF NOT EXISTS exchange TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_trades_exchange ON trades(exchange);
CREATE INDEX IF NOT EXISTS idx_positions_exchange ON positions(exchange);

-- Update existing records to have default exchange values
-- You may need to adjust these based on your actual data
UPDATE trades 
SET exchange = 'supabase' 
WHERE exchange IS NULL;

UPDATE positions 
SET exchange = 'supabase' 
WHERE exchange IS NULL;

-- Add comment
COMMENT ON COLUMN trades.exchange IS 'Exchange where the trade was executed (aster, oanda, tradier, supabase)';
COMMENT ON COLUMN positions.exchange IS 'Exchange where the position is held (aster, oanda, tradier, supabase)';
