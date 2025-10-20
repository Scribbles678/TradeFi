# TradeFI Dashboard 📊

Real-time analytics and monitoring dashboard for automated trading bots, starting with **Sparky Bot**.

**Part of the Sparky Trading Ecosystem:**
- **Sparky Bot** - Executes trades on Aster DEX (separate repo: `c:\Users\mjjoh\Sparky\`)
- **TradeFI Dashboard** (this repo) - Real-time analytics and monitoring

## System Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌───────────────────┐
│  TradingView    │         │  Sparky Bot      │         │    Supabase       │
│   Webhook       │────────▶│  (Port 3000)     │────────▶│    Database       │
│   Alerts        │         │                  │         │                   │
└─────────────────┘         │  - Logs trades   │         │  - trades table   │
                            │  - Saves positions│         │  - positions      │
                            │  - Updates prices │         │  - stats views    │
                            └──────────────────┘         └───────────────────┘
                                     │                             ▲
                                     │                             │
                                     ▼                             │
                            ┌──────────────────┐                  │
                            │  TradeFI         │──────────────────┘
                            │  Dashboard       │   (Read-only)
                            │  (Port 3001)     │
                            └──────────────────┘
```

## Phase 1 MVP Features ✅

**Currently Implemented:**
- 📊 **Real-Time Stats Overview** - Today's P&L, Win Rate, Open Positions count, Total Trades
- 📈 **Open Positions Table** - Live positions with unrealized P&L (updates every 30s)
- 📜 **Recent Trades History** - Last 20 trades with P&L
- 📉 **Simple P&L Chart** - Cumulative P&L over time (7 or 30 days)
- ⚡ **Auto-Refresh** - Dashboard refreshes every 30 seconds
- 🎨 **Modern UI** - Built with Nuxt UI and Tailwind CSS

## Tech Stack

- **Framework:** Nuxt 3 (Vue 3)
- **UI Library:** Nuxt UI (TailwindCSS)
- **Database:** Supabase (PostgreSQL)
- **Charts:** Chart.js
- **API:** Server routes + Supabase direct queries
- **TypeScript:** Full type safety

## Prerequisites

- Node.js 18+
- Access to Supabase database (shared with Sparky Bot)
- Sparky Bot running and logging to Supabase

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file in the project root:

```env
# Supabase (Read-Only Access)
SUPABASE_URL=https://yfzfdvghkhctzqjtwajy.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# Optional: Bot URL for direct API queries
SPARKY_BOT_URL=http://your-vps-ip:3000
```

**Important:** Use the **anon key** (NOT service role key) for the dashboard. The bot uses service role key for write access.

### 3. Run Development Server

```bash
npm run dev
```

Dashboard will be available at **http://localhost:3001**

### 4. Build for Production

```bash
npm run build
npm run preview
```

## How It Works with Sparky Bot

### Data Flow

1. **Sparky Bot executes trade** on Aster DEX
2. **Bot saves to Supabase:**
   - `positions` table - Open positions
   - `trades` table - Completed trades (on close)
3. **Position Updater runs every 30s:**
   - Fetches current prices from Aster API
   - Calculates unrealized P&L
   - Updates `positions` table in Supabase
4. **Dashboard reads from Supabase:**
   - Auto-refreshes every 30 seconds
   - Shows real-time positions, trades, stats

### Database Schema

**Tables:**
- `positions` - Currently open positions (1 per symbol)
- `trades` - Completed trades with P&L
- `trade_stats` - Aggregate statistics (view)

**Read by Dashboard:**
```typescript
// app/utils/supabase.ts provides:
- getOpenPositions() // Real-time positions
- getRecentTrades(limit) // Recent trade history
- getTodaysStats() // Today's P&L, win rate, etc.
- getCumulativePnL(days) // Chart data
- getTradeStats() // All-time statistics
```

### Key Files

**Dashboard Pages:**
- `app/pages/index.vue` - Main dashboard (Phase 1 MVP)
- `app/pages/sparky-dashboard.vue` - Alternative dashboard view
- `app/pages/positions-summary.vue` - Positions detail view

**Utilities:**
- `app/utils/supabase.ts` - Database client & query functions
- `server/api/sparky/health.ts` - Bot health check endpoint
- `server/api/sparky/positions.ts` - Bot positions endpoint

**Configuration:**
- `nuxt.config.ts` - Nuxt config with runtime variables
- `.env` - Environment variables (not committed)

## Dashboard Features

### Main Dashboard (/)

**Stats Cards (Top Row):**
- Today's P&L - Green/red, auto-updates
- Win Rate - Percentage of winning trades today
- Open Positions - Count of currently active trades
- Trades Today - Total trades executed today

**Open Positions Table:**
| Symbol | Side | Entry Price | Current Price | Size | Unrealized P&L | Time Open |
|--------|------|-------------|---------------|------|----------------|-----------|
| BTCUSDT | BUY | $95,000 | $98,000 | $100 | +$3.16 (3.16%) | 2h 15m |

- Updates every 30 seconds with latest prices
- Color-coded P&L (green for profit, red for loss)
- Shows stop loss and take profit levels

**Recent Trades (Right Panel):**
```
BTC  BUY   +$5.50   2h ago
ETH  SELL  +$3.20   4h ago  
SOL  BUY   -$2.10   5h ago
```

**Cumulative P&L Chart:**
- Line chart showing profit over time
- Toggle between 7-day and 30-day views
- Green line for overall profit, red for loss

### Auto-Refresh

Dashboard automatically refreshes data every 30 seconds:
```typescript
// onMounted hook
setInterval(async () => {
  await loadData() // Refetch all data from Supabase
}, 30000) // 30 seconds
```

This syncs with Sparky Bot's position updater (also 30s).

## API Endpoints

### Dashboard Server Routes

**Health Check (Sparky Bot):**
```
GET /api/sparky/health

Response:
{
  "success": true,
  "bot": {
    "status": "ok",
    "uptime": 86400,
    "apiStatus": "connected",
    "balance": 95.58,
    "openPositions": 3
  }
}
```

**Positions (Sparky Bot):**
```
GET /api/sparky/positions

Response:
{
  "success": true,
  "positions": {
    "totalPositions": 3,
    "symbols": ["BTCUSDT", "ETHUSDT", "SOLUSDT"],
    "positions": [...]
  }
}
```

## Configuration

### Runtime Config (`nuxt.config.ts`)

```typescript
runtimeConfig: {
  // Server-side only
  sparkyBotUrl: process.env.SPARKY_BOT_URL || 'http://localhost:3000',
  
  // Public (exposed to client)
  public: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_ANON_KEY
  }
}
```

### Environment Variables

**Required:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key (read-only)

**Optional:**
- `SPARKY_BOT_URL` - Sparky bot API endpoint (defaults to localhost:3000)

## Development

### Project Structure

```
tradefi/
├── app/
│   ├── pages/
│   │   ├── index.vue              # Main dashboard (Phase 1)
│   │   ├── sparky-dashboard.vue   # Alternative view
│   │   └── positions-summary.vue  # Positions detail
│   ├── utils/
│   │   └── supabase.ts           # Database client & queries
│   └── assets/
│       └── css/
│           └── main.css          # Global styles
├── server/
│   └── api/
│       └── sparky/
│           ├── health.ts         # Bot health check
│           └── positions.ts      # Bot positions
├── nuxt.config.ts                # Nuxt configuration
├── package.json                  # Dependencies
└── README.md                     # This file
```

### Adding New Features

**Example: Add Monthly Stats**

1. **Add query function** (`app/utils/supabase.ts`):
```typescript
export async function getMonthlyStats() {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .gte('exit_time', startOfMonth())
    .order('exit_time', { ascending: false })
  
  return data || []
}
```

2. **Use in component** (`app/pages/index.vue`):
```typescript
const monthlyStats = ref([])

onMounted(async () => {
  monthlyStats.value = await getMonthlyStats()
})
```

3. **Display in template**:
```vue
<UCard>
  <h3>Monthly Statistics</h3>
  <p>Total trades: {{ monthlyStats.length }}</p>
</UCard>
```

## Integration with Sparky Bot

### Setup Checklist

**Sparky Bot (VPS):**
- ✅ Bot running with Supabase credentials
- ✅ `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in bot's `.env`
- ✅ Database schema created (ran `supabase-schema.sql`)
- ✅ Position updater running (logs show "Position price updater started")

**TradeFI Dashboard (Local):**
- ✅ Dashboard running (`npm run dev`)
- ✅ `SUPABASE_URL` and `SUPABASE_ANON_KEY` in dashboard's `.env`
- ✅ Can access http://localhost:3001
- ✅ Dashboard shows data (after bot executes first trade)

### Testing Integration

**1. Execute Test Trade on Bot:**
```bash
# SSH into VPS
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your-webhook-secret",
    "action": "buy",
    "symbol": "BTCUSDT",
    "stop_loss_percent": 1.5,
    "take_profit_percent": 4.0
  }'
```

**2. Check Supabase:**
- Go to: https://app.supabase.com/project/yfzfdvghkhctzqjtwajy/editor
- Select `positions` table
- Should see BTCUSDT position

**3. Check Dashboard:**
- Refresh http://localhost:3001
- Position should appear in "Open Positions" table
- Stats should update (1 open position)
- Wait 30s - price and P&L should update

## Troubleshooting

### Dashboard Shows "No Data"

**Check:**
1. Supabase credentials correct in `.env`?
2. Bot has executed at least one trade?
3. Bot's Supabase integration working? (check bot logs)
4. Browser console errors?

**Solution:**
```bash
# Check Supabase directly
# Go to: https://app.supabase.com/project/yfzfdvghkhctzqjtwajy/editor
# Run: SELECT * FROM positions;
# Should see data if bot logged it
```

### Dashboard Not Updating

**Check:**
1. Auto-refresh working? (should happen every 30s)
2. Bot's position updater running? (check bot logs)
3. Supabase connection active?

**Solution:**
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for errors
- Verify bot logs show "Updating prices for X position(s)"

### "Cannot find module" Errors

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

## Future Enhancements

**Phase 2 (Planned):**
- [ ] Multi-bot support (track multiple bots)
- [ ] Advanced analytics (win rate by symbol, time of day, etc.)
- [ ] Trade notifications (Telegram/email)
- [ ] Export trades to CSV/PDF
- [ ] Backtesting results comparison
- [ ] Strategy performance tracking
- [ ] Risk metrics dashboard
- [ ] Multi-timeframe analysis

**Phase 3 (Future):**
- [ ] Mobile app (React Native)
- [ ] Real-time WebSocket updates
- [ ] AI-powered trade insights
- [ ] Portfolio management
- [ ] Social trading features

## Contributing

This is a personal project, but contributions welcome!

## License

MIT

## Support

**For Sparky Bot Issues:**
- Check bot logs: `pm2 logs aster-bot`
- See: `c:\Users\mjjoh\Sparky\README.md`

**For Dashboard Issues:**
- Check browser console
- Verify Supabase connection
- See: `SUPABASE_INTEGRATION.md` in Sparky repo

---

**Last Updated:** October 20, 2025  
**Version:** 1.0.0 (Phase 1 MVP Complete)  
**Status:** Production Ready ✅
