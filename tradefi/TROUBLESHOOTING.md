# TradeFI Dashboard Troubleshooting

## Issues Found and Fixed

### 1. API Routes Not Working (404 Errors)
**Problem:** The Nuxt config had a devProxy configuration that was interfering with API routes.

**Fix:** Removed the devProxy configuration from `nuxt.config.ts`:
```typescript
// REMOVED THIS:
nitro: {
  devProxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true
    }
  },
  experimental: {
    wasm: true
  }
},

// NOW JUST THIS:
nitro: {
  experimental: {
    wasm: true
  }
},
```

### 2. Dynamic Portfolio Description
**Problem:** "Across all exchanges" text didn't change when filtering by asset class.

**Fix:** Added dynamic text that changes based on selected filter:
- "All" → "Across all exchanges"
- "Forex" → "OANDA Forex only"
- "Crypto" → "Aster DEX Crypto only"
- "Options" → "Tradier Stocks/Options only"

### 3. Balance Filtering
**Problem:** Total Portfolio value wasn't filtering when selecting specific asset classes.

**Fix:** Updated `loadBalances()` function to filter balances based on selected asset class and recalculate totals.

## Current Status

The dashboard should now:
1. ✅ Show real exchange balances (when API credentials are added)
2. ✅ Filter portfolio values by asset class
3. ✅ Display dynamic descriptions
4. ✅ Update totals when switching between All/Forex/Crypto/Options

## Next Steps

1. **Add your API credentials** to the `.env` file
2. **Restart the development server** 
3. **Open http://localhost:3001** in your browser
4. **Check the browser console** (F12) for any remaining errors

## Testing the Fixes

Once you have your API credentials in the `.env` file:

1. **Open the dashboard** in your browser
2. **Click the asset class filters** (All, Forex, Crypto, Options)
3. **Verify that:**
   - Total Portfolio value changes when filtering
   - Description text updates to show which exchange(s)
   - Account page shows real balances

## Common Issues

### If balances still show $0.00:
1. Check that your `.env` file has the correct API credentials
2. Verify credentials match your Sparky bot's config
3. Check browser console for API errors
4. Ensure exchange APIs are accessible

### If API calls fail:
1. Check that the development server is running
2. Verify no firewall is blocking localhost:3001
3. Check that your API credentials have the correct permissions
4. Test individual exchange APIs directly

## API Endpoints to Test

Once the server is running, you can test these endpoints:

- `http://localhost:3001/api/balances` - All balances
- `http://localhost:3001/api/balance/aster` - Aster DEX only
- `http://localhost:3001/api/balance/oanda` - OANDA only
- `http://localhost:3001/api/balance/tradier` - Tradier only

These should return JSON responses with balance data.
