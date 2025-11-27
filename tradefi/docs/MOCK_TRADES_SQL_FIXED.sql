-- ============================================================================
-- Mock Trade Data for Cumulative P&L Chart Testing
-- ============================================================================
-- Covers 60 days with realistic trading patterns
-- Mix of winners/losers, different asset classes, varying volatility
-- Total P&L: ~$22,000 over 70 trades with ~70% win rate

-- ============================================================================
-- STEP 1: Create enum type (if needed)
-- ============================================================================
DO $$ BEGIN
  CREATE TYPE asset_class_type AS ENUM ('forex', 'crypto', 'options', 'stocks', 'futures');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- STEP 2: Get your user ID (IMPORTANT!)
-- ============================================================================
-- Run this first to get your user_id, then replace 'YOUR_USER_ID_HERE' below:
-- SELECT id FROM auth.users WHERE email = 'your@email.com';

-- ============================================================================
-- STEP 3: Insert mock trades
-- ============================================================================
-- Replace 'YOUR_USER_ID_HERE' with your actual UUID from Step 2

-- DAY 1-5: Small wins building confidence (Forex mostly)
INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason) VALUES
  ('YOUR_USER_ID_HERE', 'MOCK_EUR_USD', 'BUY', 'forex'::asset_class_type, 'oanda', 1.0850, NOW() - INTERVAL '60 days', 1.0875, NOW() - INTERVAL '60 days' + INTERVAL '4 hours', 10000, 10850, 25.00, 0.23, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_GBP_USD', 'BUY', 'forex'::asset_class_type, 'oanda', 1.2650, NOW() - INTERVAL '59 days', 1.2680, NOW() - INTERVAL '59 days' + INTERVAL '6 hours', 8000, 10120, 30.00, 0.24, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_USD_JPY', 'SELL', 'forex'::asset_class_type, 'oanda', 149.50, NOW() - INTERVAL '58 days', 149.20, NOW() - INTERVAL '58 days' + INTERVAL '3 hours', 10000, 14950, 30.00, 0.20, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_EUR_USD', 'BUY', 'forex'::asset_class_type, 'oanda', 1.0880, NOW() - INTERVAL '57 days', 1.0860, NOW() - INTERVAL '57 days' + INTERVAL '2 hours', 10000, 10880, -20.00, -0.18, false, 'stop_loss'),
  ('YOUR_USER_ID_HERE', 'MOCK_AUD_USD', 'BUY', 'forex'::asset_class_type, 'oanda', 0.6550, NOW() - INTERVAL '56 days', 0.6580, NOW() - INTERVAL '56 days' + INTERVAL '5 hours', 15000, 9825, 45.00, 0.46, true, 'take_profit');

-- DAY 6-15: Mixed crypto trades with higher volatility
INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason) VALUES
  ('YOUR_USER_ID_HERE', 'MOCK_BTCUSDT', 'BUY', 'crypto'::asset_class_type, 'aster', 42000, NOW() - INTERVAL '55 days', 43500, NOW() - INTERVAL '55 days' + INTERVAL '12 hours', 0.5, 21000, 750.00, 3.57, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_ETHUSDT', 'BUY', 'crypto'::asset_class_type, 'aster', 2200, NOW() - INTERVAL '54 days', 2150, NOW() - INTERVAL '54 days' + INTERVAL '8 hours', 10, 22000, -500.00, -2.27, false, 'stop_loss'),
  ('YOUR_USER_ID_HERE', 'MOCK_BTCUSDT', 'SELL', 'crypto'::asset_class_type, 'aster', 43800, NOW() - INTERVAL '53 days', 43200, NOW() - INTERVAL '53 days' + INTERVAL '6 hours', 0.5, 21900, 300.00, 1.37, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_SOLUSDT', 'BUY', 'crypto'::asset_class_type, 'aster', 95, NOW() - INTERVAL '52 days', 102, NOW() - INTERVAL '52 days' + INTERVAL '18 hours', 200, 19000, 1400.00, 7.37, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_ETHUSDT', 'BUY', 'crypto'::asset_class_type, 'aster', 2180, NOW() - INTERVAL '51 days', 2250, NOW() - INTERVAL '51 days' + INTERVAL '24 hours', 10, 21800, 700.00, 3.21, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_AVAXUSDT', 'BUY', 'crypto'::asset_class_type, 'aster', 32, NOW() - INTERVAL '50 days', 29, NOW() - INTERVAL '50 days' + INTERVAL '10 hours', 500, 16000, -1500.00, -9.38, false, 'stop_loss'),
  ('YOUR_USER_ID_HERE', 'MOCK_BTCUSDT', 'BUY', 'crypto'::asset_class_type, 'aster', 43500, NOW() - INTERVAL '49 days', 44200, NOW() - INTERVAL '49 days' + INTERVAL '15 hours', 0.5, 21750, 350.00, 1.61, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_LINKUSDT', 'BUY', 'crypto'::asset_class_type, 'aster', 14.5, NOW() - INTERVAL '48 days', 15.2, NOW() - INTERVAL '48 days' + INTERVAL '20 hours', 1000, 14500, 700.00, 4.83, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_MATICUSDT', 'BUY', 'crypto'::asset_class_type, 'aster', 0.85, NOW() - INTERVAL '47 days', 0.82, NOW() - INTERVAL '47 days' + INTERVAL '8 hours', 20000, 17000, -600.00, -3.53, false, 'stop_loss'),
  ('YOUR_USER_ID_HERE', 'MOCK_DOTUSDT', 'BUY', 'crypto'::asset_class_type, 'aster', 6.2, NOW() - INTERVAL '46 days', 6.5, NOW() - INTERVAL '46 days' + INTERVAL '12 hours', 2500, 15500, 750.00, 4.84, true, 'take_profit');

-- DAY 16-25: Stock and options trades
INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason) VALUES
  ('YOUR_USER_ID_HERE', 'MOCK_AAPL', 'BUY', 'stocks'::asset_class_type, 'tradier', 175.50, NOW() - INTERVAL '45 days', 178.20, NOW() - INTERVAL '45 days' + INTERVAL '5 hours', 100, 17550, 270.00, 1.54, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_TSLA', 'BUY', 'stocks'::asset_class_type, 'tradier', 242.00, NOW() - INTERVAL '44 days', 238.50, NOW() - INTERVAL '44 days' + INTERVAL '4 hours', 50, 12100, -175.00, -1.45, false, 'stop_loss'),
  ('YOUR_USER_ID_HERE', 'MOCK_NVDA', 'BUY', 'stocks'::asset_class_type, 'tradier', 485.00, NOW() - INTERVAL '43 days', 495.50, NOW() - INTERVAL '43 days' + INTERVAL '6 hours', 25, 12125, 262.50, 2.16, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_MSFT', 'BUY', 'stocks'::asset_class_type, 'tradier', 370.00, NOW() - INTERVAL '42 days', 375.80, NOW() - INTERVAL '42 days' + INTERVAL '5 hours', 30, 11100, 174.00, 1.57, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_SPY_CALL', 'BUY', 'options'::asset_class_type, 'tradier', 5.20, NOW() - INTERVAL '41 days', 6.80, NOW() - INTERVAL '41 days' + INTERVAL '3 hours', 10, 5200, 1600.00, 30.77, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_QQQ_PUT', 'BUY', 'options'::asset_class_type, 'tradier', 3.50, NOW() - INTERVAL '40 days', 2.10, NOW() - INTERVAL '40 days' + INTERVAL '2 hours', 20, 7000, -2800.00, -40.00, false, 'stop_loss'),
  ('YOUR_USER_ID_HERE', 'MOCK_GOOGL', 'BUY', 'stocks'::asset_class_type, 'tradier', 138.50, NOW() - INTERVAL '39 days', 142.10, NOW() - INTERVAL '39 days' + INTERVAL '4 hours', 75, 10387.50, 270.00, 2.60, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_AMZN', 'BUY', 'stocks'::asset_class_type, 'tradier', 145.00, NOW() - INTERVAL '38 days', 148.75, NOW() - INTERVAL '38 days' + INTERVAL '6 hours', 70, 10150, 262.50, 2.59, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_META', 'BUY', 'stocks'::asset_class_type, 'tradier', 325.00, NOW() - INTERVAL '37 days', 318.50, NOW() - INTERVAL '37 days' + INTERVAL '3 hours', 30, 9750, -195.00, -2.00, false, 'stop_loss'),
  ('YOUR_USER_ID_HERE', 'MOCK_TSLA_CALL', 'BUY', 'options'::asset_class_type, 'tradier', 8.50, NOW() - INTERVAL '36 days', 12.30, NOW() - INTERVAL '36 days' + INTERVAL '4 hours', 5, 4250, 1900.00, 44.71, true, 'take_profit');

-- DAY 26-35: Futures trading with larger position sizes
INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason) VALUES
  ('YOUR_USER_ID_HERE', 'MOCK_ES', 'BUY', 'futures'::asset_class_type, 'tastytrade', 4550.00, NOW() - INTERVAL '35 days', 4575.00, NOW() - INTERVAL '35 days' + INTERVAL '6 hours', 2, 9100, 500.00, 5.49, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_NQ', 'BUY', 'futures'::asset_class_type, 'tastytrade', 15800.00, NOW() - INTERVAL '34 days', 15650.00, NOW() - INTERVAL '34 days' + INTERVAL '4 hours', 1, 15800, -150.00, -0.95, false, 'stop_loss'),
  ('YOUR_USER_ID_HERE', 'MOCK_CL', 'SELL', 'futures'::asset_class_type, 'tastytrade', 78.50, NOW() - INTERVAL '33 days', 77.20, NOW() - INTERVAL '33 days' + INTERVAL '8 hours', 10, 7850, 1300.00, 16.56, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_GC', 'BUY', 'futures'::asset_class_type, 'tastytrade', 2020.00, NOW() - INTERVAL '32 days', 2045.00, NOW() - INTERVAL '32 days' + INTERVAL '12 hours', 5, 10100, 1250.00, 12.38, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_ES', 'SELL', 'futures'::asset_class_type, 'tastytrade', 4580.00, NOW() - INTERVAL '31 days', 4620.00, NOW() - INTERVAL '31 days' + INTERVAL '3 hours', 2, 9160, -800.00, -8.73, false, 'stop_loss'),
  ('YOUR_USER_ID_HERE', 'MOCK_NQ', 'BUY', 'futures'::asset_class_type, 'tastytrade', 15700.00, NOW() - INTERVAL '30 days', 15850.00, NOW() - INTERVAL '30 days' + INTERVAL '7 hours', 1, 15700, 150.00, 0.96, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_RTY', 'BUY', 'futures'::asset_class_type, 'tastytrade', 1950.00, NOW() - INTERVAL '29 days', 1975.00, NOW() - INTERVAL '29 days' + INTERVAL '5 hours', 3, 5850, 750.00, 12.82, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_YM', 'BUY', 'futures'::asset_class_type, 'tastytrade', 35800.00, NOW() - INTERVAL '28 days', 35650.00, NOW() - INTERVAL '28 days' + INTERVAL '4 hours', 1, 35800, -150.00, -0.42, false, 'stop_loss'),
  ('YOUR_USER_ID_HERE', 'MOCK_ES', 'BUY', 'futures'::asset_class_type, 'tastytrade', 4600.00, NOW() - INTERVAL '27 days', 4650.00, NOW() - INTERVAL '27 days' + INTERVAL '8 hours', 2, 9200, 1000.00, 10.87, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_CL', 'BUY', 'futures'::asset_class_type, 'tastytrade', 77.00, NOW() - INTERVAL '26 days', 78.50, NOW() - INTERVAL '26 days' + INTERVAL '6 hours', 10, 7700, 1500.00, 19.48, true, 'take_profit');

-- DAY 36-45: Back to mixed trading with a hot streak
INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason) VALUES
  ('YOUR_USER_ID_HERE', 'MOCK_BTCUSDT', 'BUY', 'crypto'::asset_class_type, 'aster', 44500, NOW() - INTERVAL '25 days', 46200, NOW() - INTERVAL '25 days' + INTERVAL '24 hours', 0.5, 22250, 850.00, 3.82, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_EUR_USD', 'BUY', 'forex'::asset_class_type, 'oanda', 1.0920, NOW() - INTERVAL '24 days', 1.0950, NOW() - INTERVAL '24 days' + INTERVAL '4 hours', 10000, 10920, 30.00, 0.27, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_AAPL', 'BUY', 'stocks'::asset_class_type, 'tradier', 180.00, NOW() - INTERVAL '23 days', 183.50, NOW() - INTERVAL '23 days' + INTERVAL '5 hours', 100, 18000, 350.00, 1.94, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_NVDA', 'BUY', 'stocks'::asset_class_type, 'tradier', 500.00, NOW() - INTERVAL '22 days', 515.00, NOW() - INTERVAL '22 days' + INTERVAL '6 hours', 25, 12500, 375.00, 3.00, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_ETHUSDT', 'BUY', 'crypto'::asset_class_type, 'aster', 2300, NOW() - INTERVAL '21 days', 2420, NOW() - INTERVAL '21 days' + INTERVAL '18 hours', 10, 23000, 1200.00, 5.22, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_GBP_USD', 'BUY', 'forex'::asset_class_type, 'oanda', 1.2720, NOW() - INTERVAL '20 days', 1.2760, NOW() - INTERVAL '20 days' + INTERVAL '6 hours', 8000, 10176, 40.00, 0.31, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_SPY_CALL', 'BUY', 'options'::asset_class_type, 'tradier', 6.50, NOW() - INTERVAL '19 days', 8.90, NOW() - INTERVAL '19 days' + INTERVAL '3 hours', 10, 6500, 2400.00, 36.92, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_ES', 'BUY', 'futures'::asset_class_type, 'tastytrade', 4660.00, NOW() - INTERVAL '18 days', 4700.00, NOW() - INTERVAL '18 days' + INTERVAL '5 hours', 2, 9320, 800.00, 8.58, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_SOLUSDT', 'BUY', 'crypto'::asset_class_type, 'aster', 105, NOW() - INTERVAL '17 days', 112, NOW() - INTERVAL '17 days' + INTERVAL '20 hours', 200, 21000, 1400.00, 6.67, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_TSLA', 'BUY', 'stocks'::asset_class_type, 'tradier', 245.00, NOW() - INTERVAL '16 days', 252.50, NOW() - INTERVAL '16 days' + INTERVAL '4 hours', 50, 12250, 375.00, 3.06, true, 'take_profit');

-- DAY 46-55: Volatility hits - some big losses
INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason) VALUES
  ('YOUR_USER_ID_HERE', 'MOCK_BTCUSDT', 'BUY', 'crypto'::asset_class_type, 'aster', 46500, NOW() - INTERVAL '15 days', 44200, NOW() - INTERVAL '15 days' + INTERVAL '12 hours', 0.5, 23250, -1150.00, -4.95, false, 'stop_loss'),
  ('YOUR_USER_ID_HERE', 'MOCK_NVDA', 'BUY', 'stocks'::asset_class_type, 'tradier', 518.00, NOW() - INTERVAL '14 days', 495.00, NOW() - INTERVAL '14 days' + INTERVAL '5 hours', 25, 12950, -575.00, -4.44, false, 'stop_loss'),
  ('YOUR_USER_ID_HERE', 'MOCK_QQQ_PUT', 'BUY', 'options'::asset_class_type, 'tradier', 4.20, NOW() - INTERVAL '13 days', 6.80, NOW() - INTERVAL '13 days' + INTERVAL '2 hours', 20, 8400, 5200.00, 61.90, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_ES', 'SELL', 'futures'::asset_class_type, 'tastytrade', 4690.00, NOW() - INTERVAL '12 days', 4730.00, NOW() - INTERVAL '12 days' + INTERVAL '3 hours', 2, 9380, -800.00, -8.53, false, 'stop_loss'),
  ('YOUR_USER_ID_HERE', 'MOCK_ETHUSDT', 'BUY', 'crypto'::asset_class_type, 'aster', 2400, NOW() - INTERVAL '11 days', 2280, NOW() - INTERVAL '11 days' + INTERVAL '8 hours', 10, 24000, -1200.00, -5.00, false, 'stop_loss'),
  ('YOUR_USER_ID_HERE', 'MOCK_GBP_USD', 'BUY', 'forex'::asset_class_type, 'oanda', 1.2780, NOW() - INTERVAL '10 days', 1.2820, NOW() - INTERVAL '10 days' + INTERVAL '5 hours', 8000, 10224, 40.00, 0.31, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_AAPL', 'BUY', 'stocks'::asset_class_type, 'tradier', 182.00, NOW() - INTERVAL '9 days', 178.50, NOW() - INTERVAL '9 days' + INTERVAL '4 hours', 100, 18200, -350.00, -1.92, false, 'stop_loss'),
  ('YOUR_USER_ID_HERE', 'MOCK_BTCUSDT', 'BUY', 'crypto'::asset_class_type, 'aster', 44000, NOW() - INTERVAL '8 days', 45500, NOW() - INTERVAL '8 days' + INTERVAL '15 hours', 0.5, 22000, 750.00, 3.41, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_CL', 'BUY', 'futures'::asset_class_type, 'tastytrade', 79.00, NOW() - INTERVAL '7 days', 77.50, NOW() - INTERVAL '7 days' + INTERVAL '6 hours', 10, 7900, -1500.00, -18.99, false, 'stop_loss'),
  ('YOUR_USER_ID_HERE', 'MOCK_MSFT', 'BUY', 'stocks'::asset_class_type, 'tradier', 378.00, NOW() - INTERVAL '6 days', 383.50, NOW() - INTERVAL '6 days' + INTERVAL '5 hours', 30, 11340, 165.00, 1.46, true, 'take_profit');

-- DAY 56-60: Recovery and steady growth
INSERT INTO trades (user_id, symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner, exit_reason) VALUES
  ('YOUR_USER_ID_HERE', 'MOCK_ETHUSDT', 'BUY', 'crypto'::asset_class_type, 'aster', 2320, NOW() - INTERVAL '5 days', 2450, NOW() - INTERVAL '5 days' + INTERVAL '20 hours', 10, 23200, 1300.00, 5.60, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_EUR_USD', 'BUY', 'forex'::asset_class_type, 'oanda', 1.0840, NOW() - INTERVAL '4 days', 1.0870, NOW() - INTERVAL '4 days' + INTERVAL '4 hours', 10000, 10840, 30.00, 0.28, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_SPY_CALL', 'BUY', 'options'::asset_class_type, 'tradier', 7.20, NOW() - INTERVAL '3 days', 9.50, NOW() - INTERVAL '3 days' + INTERVAL '3 hours', 10, 7200, 2300.00, 31.94, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_ES', 'BUY', 'futures'::asset_class_type, 'tastytrade', 4720.00, NOW() - INTERVAL '2 days', 4760.00, NOW() - INTERVAL '2 days' + INTERVAL '6 hours', 2, 9440, 800.00, 8.47, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_BTCUSDT', 'BUY', 'crypto'::asset_class_type, 'aster', 45800, NOW() - INTERVAL '1 day', 47200, NOW() - INTERVAL '1 day' + INTERVAL '18 hours', 0.5, 22900, 700.00, 3.06, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_NVDA', 'BUY', 'stocks'::asset_class_type, 'tradier', 505.00, NOW() - INTERVAL '12 hours', 515.50, NOW() - INTERVAL '6 hours', 25, 12625, 262.50, 2.08, true, 'take_profit'),
  ('YOUR_USER_ID_HERE', 'MOCK_SOLUSDT', 'BUY', 'crypto'::asset_class_type, 'aster', 115, NOW() - INTERVAL '6 hours', 120, NOW() - INTERVAL '2 hours', 200, 23000, 1000.00, 4.35, true, 'take_profit');

-- ============================================================================
-- STEP 4: Verify your data (optional)
-- ============================================================================
-- SELECT 
--   COUNT(*) as total_trades,
--   SUM(CASE WHEN is_winner THEN 1 ELSE 0 END) as winning_trades,
--   ROUND(AVG(CASE WHEN is_winner THEN 1 ELSE 0 END) * 100, 2) as win_rate,
--   ROUND(SUM(pnl_usd), 2) as total_pnl,
--   MIN(exit_time) as first_trade,
--   MAX(exit_time) as last_trade
-- FROM trades 
-- WHERE symbol LIKE 'MOCK_%' AND user_id = 'YOUR_USER_ID_HERE';

-- ============================================================================
-- STEP 5: Clean up mock data later (optional)
-- ============================================================================
-- DELETE FROM trades WHERE symbol LIKE 'MOCK_%' AND user_id = 'YOUR_USER_ID_HERE';

