# Sparky Dashboard Setup Guide 🚀

## What's Been Done ✅

### 1. **Database Setup**
- ✅ Created SQL schema file: `c:/Users/mjjoh/Sparky/supabase-schema.sql`
- ✅ Tables created: `trades`, `positions`
- ✅ Helper views: `todays_trades`, `positions_summary`, `trade_stats`
- ✅ Row Level Security enabled

### 2. **Sparky Bot Integration**
- ✅ Installed `@supabase/supabase-js` package
- ✅ Created Supabase client: `src/supabaseClient.js`
- ✅ Integrated trade logging in `src/tradeExecutor.js`
- ✅ Added database connection test in `src/index.js`

### 3. **TradeFI Dashboard**
- ✅ Installed `@supabase/supabase-js` package
- ✅ Created Supabase utilities: `app/utils/supabase.ts`
- ✅ Built dashboard page: `app/pages/sparky-dashboard.vue`

---

## What You Need To Do 🔧

### Step 1: Run SQL Schema in Supabase (2 minutes)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file: `c:/Users/mjjoh/Sparky/supabase-schema.sql`
6. Copy all the SQL code
7. Paste it into the SQL Editor
8. Click **Run** (or press F5)
9. You should see: "Success. No rows returned"

### Step 2: Add Supabase Credentials to Sparky Bot (1 minute)

1. Open: `c:/Users/mjjoh/Sparky/.env`
2. Add these lines at the bottom:

```env
# Supabase Configuration
SUPABASE_URL=https://yfzfdvghkhctzqjtwajy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmemZkdmdoa2hjdHpxanR3YWp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg5MjQ2NSwiZXhwIjoyMDc2NDY4NDY1fQ.wixNpfgdzJTQVU_mgBjLmezkilRwJDXoZ_v4As7ZgqY
```

3. Save the file

### Step 3: Test Sparky Bot (2 minutes)

1. Open terminal in Sparky folder:
```bash
cd c:/Users/mjjoh/Sparky
npm run dev
```

2. You should see these success messages:
```
✅ API connection successful. Available margin: $XXX.XX
✅ Database connection successful
✅ Positions synced with exchange on startup
🚀 Sparky Trading Bot started on port 3000
```

3. If you see any database errors, check that you ran the SQL schema correctly

### Step 4: Run TradeFI Dashboard (1 minute)

1. Open terminal in TradeFI folder:
```bash
cd c:/Users/mjjoh/TradeFI/tradefi
npm run dev
```

2. Open your browser to: http://localhost:3001/sparky-dashboard

3. You should see the Sparky Dashboard with:
   - Today's P&L
   - Win Rate
   - Open Positions count
   - Total Trades count
   - Open positions table (if any)
   - P&L chart (7 days / 30 days toggle)
   - Recent trades list

---

## How It Works 🔄

```
TradingView Alert
    ↓
Sparky Bot receives webhook
    ↓
Opens/Closes position on Aster DEX
    ↓
Logs to Supabase Database
    ↓
TradeFI Dashboard displays data (auto-refreshes every 30 seconds)
```

---

## Dashboard Features 📊

### Real-Time Stats (Top Cards)
- **Today's P&L**: Total profit/loss for today (green if positive, red if negative)
- **Win Rate**: Percentage of winning trades today
- **Open Positions**: Current number of active positions
- **Trades Today**: Total trades executed today

### Open Positions Table
Shows all currently open positions with:
- Symbol (e.g., BTCUSDT)
- Side (BUY/SELL)
- Entry Price
- Current Price
- Position Size ($100 by default)
- Unrealized P&L (in $ and %)
- Time Open (duration)

### Cumulative P&L Chart
- Line chart showing your total P&L over time
- Toggle between 7 days and 30 days
- Green line if profitable, red if losing
- Updates with each closed trade

### Recent Trades
- Last 20 trades
- Symbol, side, time ago
- P&L for each trade ($ and %)
- Win/Loss color coding

---

## Testing The Setup 🧪

### Option 1: Create Test Data Manually

Run this SQL in Supabase SQL Editor to create fake test data:

```sql
-- Insert a fake open position
INSERT INTO positions (symbol, side, entry_price, entry_time, quantity, position_size_usd, current_price, unrealized_pnl_usd, unrealized_pnl_percent) 
VALUES ('BTCUSDT', 'BUY', 95000, NOW(), 0.001, 100, 96000, 1.0, 1.05);

-- Insert some fake trades
INSERT INTO trades (symbol, side, entry_price, entry_time, exit_price, exit_time, quantity, position_size_usd, pnl_usd, pnl_percent, is_winner)
VALUES 
  ('ETHUSDT', 'BUY', 3500, NOW() - INTERVAL '2 hours', 3550, NOW() - INTERVAL '1 hour', 0.0286, 100, 1.43, 1.43, true),
  ('BTCUSDT', 'SELL', 95500, NOW() - INTERVAL '4 hours', 95000, NOW() - INTERVAL '3 hours', 0.00105, 100, 0.52, 0.52, true),
  ('SOLUSDT', 'BUY', 140, NOW() - INTERVAL '6 hours', 138, NOW() - INTERVAL '5 hours', 0.714, 100, -1.43, -1.43, false);
```

Refresh your dashboard and you should see the data!

### Option 2: Wait for Real Trades

Once Sparky starts executing real trades, they'll automatically appear in the dashboard.

---

## Next Steps 🎯

### Immediate (Today)
1. ✅ Run SQL schema in Supabase
2. ✅ Add credentials to Sparky `.env`
3. ✅ Test both Sparky and TradeFI
4. ✅ Insert test data or wait for real trades

### This Week (Optional Enhancements)
- [ ] Add navigation link to Sparky Dashboard in TradeFI menu
- [ ] Set up TradingView alerts to test live trading
- [ ] Deploy Sparky bot to DigitalOcean (for 24/7 operation)
- [ ] Add more stats cards (total P&L, average win/loss, etc.)

### Future Enhancements (Phase 2+)
From your original roadmap:
- Strategy performance comparison
- Enhanced charts (equity curve, daily P&L)
- Risk management dashboard
- Telegram notifications
- Email reports
- Backtesting comparison

---

## Troubleshooting 🔍

### "Database not configured" warning in Sparky
**Solution**: Make sure you added the `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to your `.env` file

### Dashboard shows "No trades yet"
**Solution**: 
1. Check that SQL schema was run successfully in Supabase
2. Insert test data (see Testing section above)
3. Or wait for Sparky to execute real trades

### Chart not showing
**Solution**: You need at least 2 trades in the database for the chart to render. Insert test data first.

### "npm run dev" fails in TradeFI
**Solution**: 
```bash
cd c:/Users/mjjoh/TradeFI/tradefi
npm install
npm run dev
```

---

## File Locations 📁

### Sparky Bot
- SQL Schema: `c:/Users/mjjoh/Sparky/supabase-schema.sql`
- Supabase Client: `c:/Users/mjjoh/Sparky/src/supabaseClient.js`
- Trade Executor: `c:/Users/mjjoh/Sparky/src/tradeExecutor.js`
- Environment: `c:/Users/mjjoh/Sparky/.env`

### TradeFI Dashboard
- Supabase Utils: `c:/Users/mjjoh/TradeFI/tradefi/app/utils/supabase.ts`
- Dashboard Page: `c:/Users/mjjoh/TradeFI/tradefi/app/pages/sparky-dashboard.vue`

---

## Security Notes 🔒

### Already Secured ✅
- Service role key only in Sparky bot (server-side)
- Anon key used in TradeFI (safe for public)
- Row Level Security enabled on all tables
- Sparky `.env` is gitignored

### Best Practices
- Never commit `.env` files to Git
- Keep service role key secret (full database access)
- Anon key is safe to expose in frontend (read-only with RLS)

---

## Support 💬

If you run into issues:
1. Check the console logs in both Sparky and TradeFI
2. Verify SQL schema was executed successfully
3. Check that credentials in `.env` match Supabase project
4. Make sure both apps are running on correct ports (Sparky:3000, TradeFI:3001)

---

**You're all set!** Once you complete the 4 steps above, you'll have a fully functional trading dashboard tracking your Sparky bot's performance in real-time. 🚀

