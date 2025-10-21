# Strategies Feature Setup

## 📋 Quick Setup (If Not Done Already)

Before you can create strategies, you need to run the database migration.

### Step 1: Run Database Migration

1. Go to your Supabase SQL Editor: https://app.supabase.com/project/yfzfdvghkhctzqjtwajy/sql
2. Open the file: `tradefi/database-strategies-schema.sql`
3. Copy all the SQL code
4. Paste it into the Supabase SQL Editor
5. Click **Run** (or press F5)
6. You should see: "Success" with some sample strategies created

### Step 2: Verify Setup

After running the migration, refresh your Strategies page. You should see:
- 5 sample strategies (Scalping Strategy, Swing Trading, Grid Trading, Arbitrage, Market Making)
- The "Add Strategy" button should work
- You can click "View/Edit Pine Script" to add code to each strategy

---

## ✅ Testing

### Create a New Strategy
1. Click **"Add Strategy"** button (top right)
2. Fill in:
   - Strategy Name (required)
   - Description
   - Asset Class (Forex, Crypto, or Options)
   - Risk Level
   - Timeframe
3. Click **"Create Strategy"**
4. You should see a success message

### Add Pine Script
1. Click **"View/Edit Pine Script"** on any strategy card
2. Paste your TradingView Pine Script code
3. Select version (v4 or v5)
4. Click **"Save Pine Script"**
5. The strategy card should now show "Pine Script Added" in green

---

## 🐛 Troubleshooting

### "Error saving strategy"
- **Check:** Did you run the database migration?
- **Solution:** Run `database-strategies-schema.sql` in Supabase SQL Editor

### No strategies showing
- **Check:** Is the Supabase connection working?
- **Check:** Did the migration run successfully?
- **Solution:** Check browser console for errors (F12 → Console tab)

### Can't save Pine Script
- **Check:** Does the strategy exist in the database?
- **Check:** Did you enter any code?
- **Solution:** Make sure to paste actual Pine Script code before saving

---

## 📊 Database Schema

The migration creates:
- `strategies` table with all strategy fields
- Sample strategies with pre-populated data
- Indexes for better performance
- Proper relationships with trades/positions tables

---

## 🎯 Next Steps After Setup

1. ✅ Create your own strategies
2. ✅ Add Pine Script code from TradingView
3. ✅ Toggle strategies active/inactive
4. ✅ Link strategies to your trading bots
5. ✅ Track performance metrics

---

**Need help?** Check the browser console (F12) for detailed error messages.

