-- Insert Fear & Greed Strategy into the database
-- This is the SQL to manually add the Fear & Greed Strategy

INSERT INTO strategies (
  name,
  description,
  asset_class,
  status,
  risk_level,
  success_rate,
  avg_profit,
  total_trades,
  winning_trades,
  losing_trades,
  timeframe,
  pine_script,
  pine_script_version,
  stop_loss_percent,
  take_profit_percent,
  notes
) VALUES (
  'Fear & Greed Strategy',
  'Automated strategy that buys during fear and sells during greed. Uses the Crypto Fear & Greed Index to identify optimal entry and exit points based on market sentiment.',
  'crypto',
  'testing',
  'medium',
  70.00,
  4.50,
  0,
  0,
  0,
  '4h',
  NULL, -- Pine Script will be added later
  'v5',
  3.00, -- Stop Loss: 3% below entry
  NULL, -- Take Profit: Scale out at multiple levels (null for now)
  'Strategy that uses the Crypto Fear & Greed Index (https://alternative.me/crypto/fear-and-greed-index/) to make trading decisions. Buy signals when index < 45 (fear), sell signals when index > 65 (greed). Uses Dollar Cost Averaging in extreme fear and takes profits gradually in extreme greed.'
);

