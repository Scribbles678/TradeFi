# 🔍 Supabase Schema Review & Recommendations

## 📊 Current State Analysis

### ✅ **Well-Structured Tables**

1. **`bot_credentials`** ✅
   - Has `user_id` with proper foreign key
   - Unique constraint: `(user_id, exchange, environment)`
   - RLS policies enabled
   - Good indexes on `user_id`, `exchange`, and composite key
   - **Note**: Since we simplified to only use 'production', consider simplifying unique constraint to `(user_id, exchange)`

2. **`user_profiles`** ✅
   - Proper foreign key to `auth.users(id)`
   - RLS policies enabled
   - Auto-creation trigger in place

### ⚠️ **Issues Found**

#### **1. Missing `user_id` in Base Schema Files**

The following tables have `user_id` added via `auth_migration.sql` but **NOT in their base schema files**:
- `trades.sql` - Missing `user_id` column
- `strategies.sql` - Missing `user_id` column  
- `positions.sql` - Missing `user_id` column
- `trade_settings_global.sql` - Missing `user_id` column
- `trade_settings_exchange.sql` - Missing `user_id` column

**Problem**: If someone recreates the database from scratch using only the schema files, these tables won't have `user_id`, breaking multi-tenancy.

**Solution**: Add `user_id` to all base schema files.

---

#### **2. `tradier_option_trades` Table - NOT Multi-Tenant!** 🚨

**Critical Issue**: This table has **NO `user_id` column** and **NO RLS policies**.

**Current State**:
```sql
-- No user_id, no RLS, no user isolation!
CREATE TABLE public.tradier_option_trades (...)
```

**Impact**: 
- All users can see all option trades
- No data isolation
- Security risk

**Solution**: Add `user_id` column and RLS policies.

---

#### **3. Views May Not Filter by User**

The following views don't have schema files:
- `positions_summary` (view)
- `todays_trades` (view)
- `trade_stats` (view)

**Problem**: These views might not be filtering by `user_id`, which means:
- Users could see other users' data
- Performance issues (scanning all data instead of user-specific)

**Solution**: Review view definitions and ensure they filter by `user_id` or use RLS.

---

#### **4. Missing Composite Indexes**

For better query performance, consider adding composite indexes on frequently queried columns with `user_id`:

**Recommended Indexes**:
```sql
-- For trades table
CREATE INDEX idx_trades_user_id_created_at ON trades(user_id, created_at DESC);
CREATE INDEX idx_trades_user_id_asset_class ON trades(user_id, asset_class);

-- For strategies table  
CREATE INDEX idx_strategies_user_id_status ON strategies(user_id, status);

-- For positions table
CREATE INDEX idx_positions_user_id_exchange ON positions(user_id, exchange);
```

---

#### **5. `bot_credentials` Unique Constraint**

**Current**: `UNIQUE (user_id, exchange, environment)`

**Since we simplified to only use 'production' environment**, consider:
- Simplifying to: `UNIQUE (user_id, exchange)`
- Or keeping it if you plan to support multiple environments again

---

## 🔧 Recommended Fixes

### **Priority 1: Critical (Security)**

1. **Add `user_id` to `tradier_option_trades` table**
2. **Add RLS policies to `tradier_option_trades`**
3. **Review and fix views to ensure user filtering**

### **Priority 2: Important (Data Integrity)**

4. **Add `user_id` to all base schema files** (not just migrations)
5. **Add composite indexes for better performance**

### **Priority 3: Optimization**

6. **Simplify `bot_credentials` unique constraint** (if staying with production-only)
7. **Add missing indexes for common query patterns**

---

## 📝 SQL Fixes Needed

### **Fix 1: Add `user_id` to `tradier_option_trades`**

```sql
-- Add user_id column
ALTER TABLE public.tradier_option_trades 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index
CREATE INDEX IF NOT EXISTS idx_tradier_option_trades_user_id 
ON public.tradier_option_trades(user_id);

-- Enable RLS
ALTER TABLE public.tradier_option_trades ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their own option trades"
  ON public.tradier_option_trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own option trades"
  ON public.tradier_option_trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own option trades"
  ON public.tradier_option_trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own option trades"
  ON public.tradier_option_trades FOR DELETE
  USING (auth.uid() = user_id);
```

### **Fix 2: Update Base Schema Files**

Add `user_id` column to these schema files:
- `trades.sql`
- `strategies.sql`
- `positions.sql`
- `trade_settings_global.sql`
- `trade_settings_exchange.sql`

### **Fix 3: Review Views**

Check if these views filter by `user_id`:
```sql
-- Example: positions_summary should filter by user_id
CREATE OR REPLACE VIEW positions_summary AS
SELECT 
  user_id,  -- Ensure this is included
  exchange,
  COUNT(*) as total_positions,
  SUM(position_size_usd) as total_value
FROM positions
GROUP BY user_id, exchange;
```

---

## ✅ What's Working Well

1. **RLS is properly enabled** on all main tables
2. **Foreign keys are correct** with `ON DELETE CASCADE`
3. **Indexes are in place** for `user_id` columns
4. **`bot_credentials` structure is solid** for multi-user API key storage
5. **Unique constraints prevent duplicate credentials** per user/exchange

---

## 🎯 Summary

**Overall Assessment**: Your schema is **mostly well-structured** for multi-tenancy, but there are **critical gaps**:

1. ✅ **API Credentials Storage**: Excellent (`bot_credentials` table)
2. ⚠️ **Option Trades**: **NOT multi-tenant** (needs immediate fix)
3. ⚠️ **Schema Files**: Missing `user_id` in base files (should fix for consistency)
4. ⚠️ **Views**: Need review to ensure user filtering
5. ✅ **RLS Policies**: Properly configured for main tables

**Next Steps**: 
1. Run the SQL fix for `tradier_option_trades`
2. Update base schema files to include `user_id`
3. Review view definitions
4. Add composite indexes for performance

