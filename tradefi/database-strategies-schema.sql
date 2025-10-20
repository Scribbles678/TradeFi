-- Database Schema: Strategies Table
-- Created: October 20, 2025
-- Purpose: Store trading strategies with Pine Script code

-- Create strategies table
CREATE TABLE IF NOT EXISTS strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  asset_class asset_class_type, -- forex, crypto, options (reuses existing enum)
  
  -- Status
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'testing')),
  
  -- Pine Script
  pine_script TEXT, -- The actual TradingView Pine Script code
  pine_script_version TEXT DEFAULT 'v5', -- Pine Script version (v4, v5, etc)
  
  -- Performance Metrics (calculated from trades)
  success_rate DECIMAL(5,2), -- Win rate percentage
  avg_profit DECIMAL(10,2), -- Average profit per trade
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  
  -- Risk Management
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  max_position_size_usd DECIMAL(10,2),
  stop_loss_percent DECIMAL(5,2),
  take_profit_percent DECIMAL(5,2),
  
  -- Trading Settings
  timeframe TEXT, -- e.g., '1m', '5m', '15m', '1h', '4h', '1d'
  symbols TEXT[], -- Array of symbols this strategy trades
  
  -- Webhook
  webhook_secret TEXT, -- Secret for TradingView webhook
  
  -- Notes
  notes TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_strategies_status ON strategies(status);
CREATE INDEX IF NOT EXISTS idx_strategies_asset_class ON strategies(asset_class);
CREATE INDEX IF NOT EXISTS idx_strategies_name ON strategies(name);

-- Add RLS (Row Level Security)
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (adjust as needed)
CREATE POLICY "Allow all operations on strategies" ON strategies
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_strategies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER strategies_updated_at
  BEFORE UPDATE ON strategies
  FOR EACH ROW
  EXECUTE FUNCTION update_strategies_updated_at();

-- Add relationship: trades should reference strategy
-- (Only run this if you want to track which strategy created each trade)
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS strategy_id UUID REFERENCES strategies(id);

ALTER TABLE positions 
ADD COLUMN IF NOT EXISTS strategy_id UUID REFERENCES strategies(id);

-- Create indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_trades_strategy_id ON trades(strategy_id);
CREATE INDEX IF NOT EXISTS idx_positions_strategy_id ON positions(strategy_id);

-- Insert some sample strategies
INSERT INTO strategies (name, description, asset_class, status, risk_level, success_rate, avg_profit, total_trades, winning_trades, losing_trades, timeframe, pine_script) VALUES
('Scalping Strategy', 'Quick trades with small profit targets, focusing on high-frequency opportunities.', 'crypto', 'active', 'medium', 75.00, 1.20, 100, 75, 25, '5m', '// @version=5
strategy("Scalping Strategy", overlay=true)

// Sample scalping strategy
fastMA = ta.sma(close, 9)
slowMA = ta.sma(close, 21)

// Entry conditions
longCondition = ta.crossover(fastMA, slowMA)
shortCondition = ta.crossunder(fastMA, slowMA)

if (longCondition)
    strategy.entry("Long", strategy.long)
if (shortCondition)
    strategy.entry("Short", strategy.short)

// Plot MAs
plot(fastMA, color=color.blue)
plot(slowMA, color=color.red)'),

('Swing Trading', 'Medium-term trades capturing larger price movements over days or weeks.', 'crypto', 'active', 'medium', 65.00, 5.80, 50, 33, 17, '4h', '// @version=5
strategy("Swing Trading Strategy", overlay=true)

// RSI and Moving Average based swing strategy
rsi = ta.rsi(close, 14)
ma50 = ta.sma(close, 50)
ma200 = ta.sma(close, 200)

// Entry conditions
longCondition = ta.crossover(close, ma50) and rsi < 70
shortCondition = ta.crossunder(close, ma50) and rsi > 30

if (longCondition)
    strategy.entry("Long", strategy.long)
if (shortCondition)
    strategy.close("Long")

plot(ma50, color=color.blue)
plot(ma200, color=color.orange)'),

('Grid Trading', 'Automated buy and sell orders at predetermined price levels.', 'crypto', 'inactive', 'low', 80.00, 3.50, 200, 160, 40, '1h', NULL),

('Arbitrage', 'Exploiting price differences between different exchanges.', 'crypto', 'active', 'low', 90.00, 0.80, 300, 270, 30, '1m', NULL),

('Market Making', 'Providing liquidity by placing both buy and sell orders.', 'forex', 'inactive', 'medium', 85.00, 2.10, 150, 128, 22, '15m', NULL);

-- Verify the data
SELECT id, name, status, asset_class, pine_script IS NOT NULL as has_script FROM strategies ORDER BY created_at;

COMMENT ON TABLE strategies IS 'Trading strategies with Pine Script code and performance metrics';
COMMENT ON COLUMN strategies.pine_script IS 'TradingView Pine Script code for this strategy';
COMMENT ON COLUMN strategies.webhook_secret IS 'Secret token for TradingView webhook authentication';

