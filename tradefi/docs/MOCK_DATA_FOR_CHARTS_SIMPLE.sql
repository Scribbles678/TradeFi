-- ============================================================================
-- Mock Data for Performance Charts - SIMPLE VERSION
-- ============================================================================
-- This script creates strategies and trades data to populate all the charts
-- on the Performance page.
--
-- INSTRUCTIONS:
-- 1. Replace 'YOUR_USER_ID_HERE' below with your actual user UUID
--    (Find it in Supabase: Authentication > Users > Copy UUID)
-- 2. Copy and paste this entire script into Supabase SQL Editor
-- 3. Run the script
-- 4. Refresh your Performance page to see the charts populated
-- ============================================================================

-- IMPORTANT: Replace this with your actual user UUID
-- Example: 'e0470a70-f1f7-46bd-933f-b34afbcdb940'
\set user_id 'e0470a70-f1f7-46bd-933f-b34afbcdb940'

-- ============================================================================
-- STEP 1: Create Active Strategies
-- ============================================================================

INSERT INTO strategies (name, description, asset_class, status, risk_level, success_rate, avg_profit, total_trades, winning_trades, losing_trades, max_position_size_usd, stop_loss_percent, take_profit_percent, timeframe)
VALUES
  ('Momentum Breakout', 'Trades momentum breakouts across crypto and stocks', 'crypto', 'active', 'medium', 65.5, 450.00, 0, 0, 0, 10000.00, 2.0, 4.0, '15m'),
  ('Forex Scalper', 'High-frequency forex scalping strategy', 'forex', 'active', 'low', 72.3, 35.00, 0, 0, 0, 5000.00, 1.5, 2.5, '5m'),
  ('Options Premium', 'Options trading focused on premium collection', 'options', 'active', 'high', 58.2, 850.00, 0, 0, 0, 15000.00, 3.0, 6.0, '1h'),
  ('Trend Follower', 'Follows strong trends in all asset classes', 'stocks', 'active', 'medium', 68.7, 320.00, 0, 0, 0, 8000.00, 2.5, 5.0, '30m')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 2: Create Trades Spread Over Last 30 Days
-- ============================================================================
-- Note: Replace 'YOUR_USER_ID_HERE' in each INSERT statement with your actual UUID

-- Get strategy IDs (you can run this separately to verify)
-- SELECT id, name FROM strategies WHERE status = 'active' ORDER BY name;

-- DAY 1-5: Momentum Breakout Strategy (Crypto) - 5 trades
INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'BTCUSDT', 'BUY', 'crypto', 'aster',
  42000, NOW() - INTERVAL '30 days' + INTERVAL '2 hours',
  43500, NOW() - INTERVAL '30 days' + INTERVAL '14 hours',
  0.5, 21000, 750.00, 3.57, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Momentum Breakout' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'ETHUSDT', 'BUY', 'crypto', 'aster',
  2200, NOW() - INTERVAL '29 days' + INTERVAL '4 hours',
  2280, NOW() - INTERVAL '29 days' + INTERVAL '12 hours',
  10, 22000, 800.00, 3.64, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Momentum Breakout' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'SOLUSDT', 'BUY', 'crypto', 'aster',
  95, NOW() - INTERVAL '28 days' + INTERVAL '6 hours',
  88, NOW() - INTERVAL '28 days' + INTERVAL '10 hours',
  200, 19000, -1400.00, -7.37, false, 'stop_loss',
  (SELECT id FROM strategies WHERE name = 'Momentum Breakout' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'AVAXUSDT', 'BUY', 'crypto', 'aster',
  32, NOW() - INTERVAL '27 days' + INTERVAL '8 hours',
  35, NOW() - INTERVAL '27 days' + INTERVAL '16 hours',
  500, 16000, 1500.00, 9.38, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Momentum Breakout' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'LINKUSDT', 'BUY', 'crypto', 'aster',
  14.5, NOW() - INTERVAL '26 days' + INTERVAL '10 hours',
  15.2, NOW() - INTERVAL '26 days' + INTERVAL '20 hours',
  1000, 14500, 700.00, 4.83, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Momentum Breakout' LIMIT 1);

-- DAY 6-10: Forex Scalper Strategy - 5 trades
INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'EUR_USD', 'BUY', 'forex', 'oanda',
  1.0850, NOW() - INTERVAL '25 days' + INTERVAL '1 hour',
  1.0875, NOW() - INTERVAL '25 days' + INTERVAL '5 hours',
  10000, 10850, 25.00, 0.23, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Forex Scalper' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'GBP_USD', 'BUY', 'forex', 'oanda',
  1.2650, NOW() - INTERVAL '24 days' + INTERVAL '2 hours',
  1.2680, NOW() - INTERVAL '24 days' + INTERVAL '6 hours',
  8000, 10120, 30.00, 0.24, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Forex Scalper' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'USD_JPY', 'SELL', 'forex', 'oanda',
  149.50, NOW() - INTERVAL '23 days' + INTERVAL '3 hours',
  149.20, NOW() - INTERVAL '23 days' + INTERVAL '7 hours',
  10000, 14950, 30.00, 0.20, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Forex Scalper' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'EUR_USD', 'BUY', 'forex', 'oanda',
  1.0880, NOW() - INTERVAL '22 days' + INTERVAL '4 hours',
  1.0860, NOW() - INTERVAL '22 days' + INTERVAL '6 hours',
  10000, 10880, -20.00, -0.18, false, 'stop_loss',
  (SELECT id FROM strategies WHERE name = 'Forex Scalper' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'AUD_USD', 'BUY', 'forex', 'oanda',
  0.6550, NOW() - INTERVAL '21 days' + INTERVAL '5 hours',
  0.6580, NOW() - INTERVAL '21 days' + INTERVAL '9 hours',
  15000, 9825, 45.00, 0.46, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Forex Scalper' LIMIT 1);

-- DAY 11-15: Options Premium Strategy - 5 trades
INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'SPY_CALL', 'BUY', 'options', 'tradier',
  5.20, NOW() - INTERVAL '20 days' + INTERVAL '1 hour',
  6.80, NOW() - INTERVAL '20 days' + INTERVAL '4 hours',
  10, 5200, 1600.00, 30.77, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Options Premium' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'QQQ_PUT', 'BUY', 'options', 'tradier',
  3.50, NOW() - INTERVAL '19 days' + INTERVAL '2 hours',
  2.10, NOW() - INTERVAL '19 days' + INTERVAL '4 hours',
  20, 7000, -2800.00, -40.00, false, 'stop_loss',
  (SELECT id FROM strategies WHERE name = 'Options Premium' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'TSLA_CALL', 'BUY', 'options', 'tradier',
  8.50, NOW() - INTERVAL '18 days' + INTERVAL '3 hours',
  12.30, NOW() - INTERVAL '18 days' + INTERVAL '7 hours',
  5, 4250, 1900.00, 44.71, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Options Premium' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'SPY_CALL', 'BUY', 'options', 'tradier',
  6.50, NOW() - INTERVAL '17 days' + INTERVAL '1 hour',
  8.90, NOW() - INTERVAL '17 days' + INTERVAL '4 hours',
  10, 6500, 2400.00, 36.92, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Options Premium' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'QQQ_PUT', 'BUY', 'options', 'tradier',
  4.20, NOW() - INTERVAL '16 days' + INTERVAL '2 hours',
  6.80, NOW() - INTERVAL '16 days' + INTERVAL '5 hours',
  20, 8400, 5200.00, 61.90, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Options Premium' LIMIT 1);

-- DAY 16-20: Trend Follower Strategy (Stocks) - 5 trades
INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'AAPL', 'BUY', 'stocks', 'tradier',
  175.50, NOW() - INTERVAL '15 days' + INTERVAL '2 hours',
  178.20, NOW() - INTERVAL '15 days' + INTERVAL '7 hours',
  100, 17550, 270.00, 1.54, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Trend Follower' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'TSLA', 'BUY', 'stocks', 'tradier',
  242.00, NOW() - INTERVAL '14 days' + INTERVAL '3 hours',
  238.50, NOW() - INTERVAL '14 days' + INTERVAL '7 hours',
  50, 12100, -175.00, -1.45, false, 'stop_loss',
  (SELECT id FROM strategies WHERE name = 'Trend Follower' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'NVDA', 'BUY', 'stocks', 'tradier',
  485.00, NOW() - INTERVAL '13 days' + INTERVAL '4 hours',
  495.50, NOW() - INTERVAL '13 days' + INTERVAL '8 hours',
  25, 12125, 262.50, 2.16, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Trend Follower' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'MSFT', 'BUY', 'stocks', 'tradier',
  370.00, NOW() - INTERVAL '12 days' + INTERVAL '5 hours',
  375.80, NOW() - INTERVAL '12 days' + INTERVAL '9 hours',
  30, 11100, 174.00, 1.57, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Trend Follower' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'GOOGL', 'BUY', 'stocks', 'tradier',
  138.50, NOW() - INTERVAL '11 days' + INTERVAL '6 hours',
  142.10, NOW() - INTERVAL '11 days' + INTERVAL '10 hours',
  75, 10387.50, 270.00, 2.60, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Trend Follower' LIMIT 1);

-- DAY 21-25: Mixed strategies - 5 trades
INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'BTCUSDT', 'BUY', 'crypto', 'aster',
  44500, NOW() - INTERVAL '10 days' + INTERVAL '2 hours',
  46200, NOW() - INTERVAL '10 days' + INTERVAL '14 hours',
  0.5, 22250, 850.00, 3.82, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Momentum Breakout' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'EUR_USD', 'BUY', 'forex', 'oanda',
  1.0920, NOW() - INTERVAL '9 days' + INTERVAL '3 hours',
  1.0950, NOW() - INTERVAL '9 days' + INTERVAL '7 hours',
  10000, 10920, 30.00, 0.27, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Forex Scalper' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'AAPL', 'BUY', 'stocks', 'tradier',
  180.00, NOW() - INTERVAL '8 days' + INTERVAL '4 hours',
  183.50, NOW() - INTERVAL '8 days' + INTERVAL '8 hours',
  100, 18000, 350.00, 1.94, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Trend Follower' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'SPY_CALL', 'BUY', 'options', 'tradier',
  7.20, NOW() - INTERVAL '7 days' + INTERVAL '5 hours',
  9.50, NOW() - INTERVAL '7 days' + INTERVAL '8 hours',
  10, 7200, 2300.00, 31.94, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Options Premium' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'ETHUSDT', 'BUY', 'crypto', 'aster',
  2300, NOW() - INTERVAL '6 days' + INTERVAL '6 hours',
  2420, NOW() - INTERVAL '6 days' + INTERVAL '18 hours',
  10, 23000, 1200.00, 5.22, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Momentum Breakout' LIMIT 1);

-- DAY 26-30: Recent activity - 6 trades
INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'GBP_USD', 'BUY', 'forex', 'oanda',
  1.2720, NOW() - INTERVAL '5 days' + INTERVAL '2 hours',
  1.2760, NOW() - INTERVAL '5 days' + INTERVAL '6 hours',
  8000, 10176, 40.00, 0.31, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Forex Scalper' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'NVDA', 'BUY', 'stocks', 'tradier',
  500.00, NOW() - INTERVAL '4 days' + INTERVAL '3 hours',
  515.00, NOW() - INTERVAL '4 days' + INTERVAL '7 hours',
  25, 12500, 375.00, 3.00, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Trend Follower' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'SOLUSDT', 'BUY', 'crypto', 'aster',
  105, NOW() - INTERVAL '3 days' + INTERVAL '4 hours',
  112, NOW() - INTERVAL '3 days' + INTERVAL '20 hours',
  200, 21000, 1400.00, 6.67, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Momentum Breakout' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'TSLA', 'BUY', 'stocks', 'tradier',
  245.00, NOW() - INTERVAL '2 days' + INTERVAL '5 hours',
  252.50, NOW() - INTERVAL '2 days' + INTERVAL '9 hours',
  50, 12250, 375.00, 3.06, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Trend Follower' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'BTCUSDT', 'BUY', 'crypto', 'aster',
  45800, NOW() - INTERVAL '1 day' + INTERVAL '6 hours',
  47200, NOW() - INTERVAL '1 day' + INTERVAL '18 hours',
  0.5, 22900, 700.00, 3.06, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Momentum Breakout' LIMIT 1);

INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason, strategy_id)
SELECT 
  'YOUR_USER_ID_HERE'::uuid,
  'EUR_USD', 'BUY', 'forex', 'oanda',
  1.0840, NOW() - INTERVAL '12 hours',
  1.0870, NOW() - INTERVAL '8 hours',
  10000, 10840, 30.00, 0.28, true, 'take_profit',
  (SELECT id FROM strategies WHERE name = 'Forex Scalper' LIMIT 1);

-- ============================================================================
-- VERIFICATION QUERIES (Run these to check the data)
-- ============================================================================

-- Check strategies created
SELECT id, name, status, asset_class FROM strategies WHERE status = 'active' ORDER BY name;

-- Check trades summary
SELECT 
  COUNT(*) as total_trades,
  COUNT(DISTINCT strategy_id) as strategies_used,
  SUM(pnl_usd) as total_pnl,
  COUNT(*) FILTER (WHERE is_winner = true) as winning_trades,
  COUNT(*) FILTER (WHERE is_winner = false) as losing_trades,
  ROUND(100.0 * COUNT(*) FILTER (WHERE is_winner = true) / COUNT(*), 2) as win_rate_percent
FROM trades 
WHERE user_id = 'YOUR_USER_ID_HERE'::uuid
  AND entry_time >= NOW() - INTERVAL '30 days';

-- Check trades by strategy
SELECT 
  s.name as strategy_name,
  COUNT(t.id) as trade_count,
  SUM(t.pnl_usd) as total_pnl,
  COUNT(*) FILTER (WHERE t.is_winner = true) as wins,
  COUNT(*) FILTER (WHERE t.is_winner = false) as losses,
  ROUND(100.0 * COUNT(*) FILTER (WHERE t.is_winner = true) / COUNT(*), 2) as win_rate
FROM trades t
JOIN strategies s ON t.strategy_id = s.id
WHERE t.user_id = 'YOUR_USER_ID_HERE'::uuid
  AND t.entry_time >= NOW() - INTERVAL '30 days'
GROUP BY s.name
ORDER BY trade_count DESC;

-- Check trades by asset class
SELECT 
  asset_class,
  COUNT(*) as trade_count,
  SUM(pnl_usd) as total_pnl,
  ROUND(100.0 * COUNT(*) FILTER (WHERE is_winner = true) / COUNT(*), 2) as win_rate
FROM trades
WHERE user_id = 'YOUR_USER_ID_HERE'::uuid
  AND entry_time >= NOW() - INTERVAL '30 days'
GROUP BY asset_class
ORDER BY trade_count DESC;

-- ============================================================================
-- CLEANUP (Run this if you want to remove the mock data)
-- ============================================================================
-- DELETE FROM trades WHERE user_id = 'YOUR_USER_ID_HERE'::uuid AND entry_time >= NOW() - INTERVAL '30 days';
-- DELETE FROM strategies WHERE name IN ('Momentum Breakout', 'Forex Scalper', 'Options Premium', 'Trend Follower');

