# TradeFI Operations Handbook

Central reference for keeping TradeFI and Sparky healthy in production. Whenever you touch data flows, Supabase schemas, or bot integrations, update this document.

**Supabase credentials:** Store `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in `.env`. The anon key is exposed to the browser for read-only queries; the service key is used only inside Nuxt server routes for writes (trade logging, Trade Settings saves, etc.). Never ship the service key to clients or commit it to git.

---

## 1. Trade Logging Setup

The dashboard only reflects what Sparky writes to Supabase. Make sure bots call the logging endpoints.

### API Endpoints
- `POST /api/trades/save` – log completed trades
- `POST /api/positions/save` – log open positions

### Example Payloads
```javascript
// Completed trade
await fetch('/api/trades/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    symbol: 'BTCUSDT',
    side: 'BUY',
    asset_class: 'crypto',
    exchange: 'aster',
    entry_price: 95000,
    exit_price: 96000,
    entry_time: '2025-11-14T10:00:00Z',
    exit_time: '2025-11-14T11:00:00Z',
    quantity: 0.001,
    position_size_usd: 95,
    pnl_usd: 1.0,
    pnl_percent: 1.05,
    is_winner: true
  })
});
```

```javascript
// Open position
await fetch('/api/positions/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    symbol: 'BTCUSDT',
    side: 'BUY',
    asset_class: 'crypto',
    exchange: 'aster',
    entry_price: 95000,
    quantity: 0.001,
    position_size_usd: 95,
    current_price: 96000,
    unrealized_pnl_usd: 1.0,
    unrealized_pnl_percent: 1.05
  })
});
```

### Steps to Verify
1. Run `node test-trade-logging.js` with the Nuxt server running.
2. Check Supabase tables (`trades`, `positions`) for new rows.
3. Refresh the dashboard – recent trades, open positions, and charts should populate.

---

## 2. Troubleshooting Checklist

### API Routes Return 404
- Remove any lingering `devProxy` entries from `nuxt.config.ts` (handled already).

### Portfolio Description/Balance Filters Wrong
- Ensure `loadBalances()` receives the current asset class filter.

### Balances Show `---`
1. Validate `.env` credentials.
2. Confirm credentials match Sparky’s config.
3. Check browser console (F12) for API errors.

### No Trades/Positions
1. Confirm Sparky writes to Supabase (check bot logs).
2. Test API endpoints manually.
3. Insert test data via the SQL block below.

### API Diagnostics
```bash
curl http://localhost:3001/api/balances
curl http://localhost:3001/api/balance/aster
curl http://localhost:3001/api/balance/oanda
curl http://localhost:3001/api/balance/tradier
curl http://localhost:3001/api/balance/tastytrade
```

### Insert Test Data
```sql
INSERT INTO positions (symbol, side, asset_class, exchange, entry_price, entry_time, quantity, position_size_usd, current_price, unrealized_pnl_usd, unrealized_pnl_percent)
VALUES ('BTCUSDT', 'BUY', 'crypto', 'aster', 95000, NOW(), 0.001, 95, 96000, 1.0, 1.05);

INSERT INTO trades (symbol, side, asset_class, exchange, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner)
VALUES ('ETHUSDT', 'BUY', 'crypto', 'aster', 3500, NOW() - INTERVAL '2 hours', 3550, NOW() - INTERVAL '1 hour', 0.0286, 100, 1.43, 1.43, TRUE);
```

---

## 3. Supabase Permissions & RLS

If tables look read-only, run `tradefi/database-fix-permissions.sql` or use the snippet below.

### Disable RLS (Dev/Personal)
```sql
ALTER TABLE trades DISABLE ROW LEVEL SECURITY;
ALTER TABLE positions DISABLE ROW LEVEL SECURITY;
ALTER TABLE strategies DISABLE ROW LEVEL SECURITY;
ALTER TABLE trade_settings_global DISABLE ROW LEVEL SECURITY;
ALTER TABLE trade_settings_exchange DISABLE ROW LEVEL SECURITY;
ALTER TABLE tradier_option_trades DISABLE ROW LEVEL SECURITY;

GRANT ALL ON trades, positions, strategies, trade_settings_global, trade_settings_exchange, tradier_option_trades
TO service_role, authenticated, anon;
```

### Inspect Table Inventory
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables include:
- `positions`, `positions_summary`
- `strategies`
- `todays_trades`
- `trade_settings_global`, `trade_settings_exchange`
- `trade_stats`
- `trades`
- `tradier_option_trades`

### Security Reminder
- Disable RLS only for dev/personal projects.
- For production, enable RLS with explicit policies (e.g., user_id matching).

---

## 4. Documentation & Maintenance

- Update this handbook anytime you change logging, troubleshooting steps, permissions, or Supabase schemas.
- Trade Settings UI mirrors `/Sparky/supabase-trade-settings.sql`; changes there must be documented here.
- Sparky also ships `supabase-option-trades.sql`—capture any updates that affect options/futures logging.
- When in doubt, note the change in `tradefi/README.md` and link back to this handbook.

