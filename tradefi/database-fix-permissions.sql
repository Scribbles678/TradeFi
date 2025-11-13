-- Fix Database Permissions to Allow Edits
-- Run this in Supabase SQL Editor to make all tables editable
-- This disables RLS (Row Level Security) and ensures INSERT/UPDATE/DELETE permissions

-- ========================================
-- 1. CHECK IF TABLES EXIST AND ARE TABLES (NOT VIEWS)
-- ========================================

-- Check what 'trades' is (table or view)
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('trades', 'positions', 'strategies', 'trade_stats');

-- ========================================
-- 2. DISABLE RLS (Row Level Security) ON TABLES
-- ========================================

-- Disable RLS on trades table (allows all operations)
ALTER TABLE IF EXISTS trades DISABLE ROW LEVEL SECURITY;

-- Disable RLS on positions table
ALTER TABLE IF EXISTS positions DISABLE ROW LEVEL SECURITY;

-- Disable RLS on strategies table
ALTER TABLE IF EXISTS strategies DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 3. DROP EXISTING RLS POLICIES (if any)
-- ========================================

-- Drop all policies on trades table
DROP POLICY IF EXISTS "Allow all operations on trades" ON trades;
DROP POLICY IF EXISTS "Public trades are viewable by everyone" ON trades;
DROP POLICY IF EXISTS "Users can insert trades" ON trades;
DROP POLICY IF EXISTS "Users can update trades" ON trades;
DROP POLICY IF EXISTS "Users can delete trades" ON trades;

-- Drop all policies on positions table
DROP POLICY IF EXISTS "Allow all operations on positions" ON positions;
DROP POLICY IF EXISTS "Public positions are viewable by everyone" ON positions;
DROP POLICY IF EXISTS "Users can insert positions" ON positions;
DROP POLICY IF EXISTS "Users can update positions" ON positions;
DROP POLICY IF EXISTS "Users can delete positions" ON positions;

-- Drop all policies on strategies table
DROP POLICY IF EXISTS "Allow all operations on strategies" ON strategies;
DROP POLICY IF EXISTS "Public strategies are viewable by everyone" ON strategies;
DROP POLICY IF EXISTS "Users can insert strategies" ON strategies;
DROP POLICY IF EXISTS "Users can update strategies" ON strategies;
DROP POLICY IF EXISTS "Users can delete strategies" ON strategies;

-- ========================================
-- 4. GRANT PERMISSIONS TO AUTHENTICATED USERS
-- ========================================

-- Grant all permissions on trades table
GRANT ALL ON trades TO authenticated;
GRANT ALL ON trades TO anon;
GRANT ALL ON trades TO service_role;

-- Grant all permissions on positions table
GRANT ALL ON positions TO authenticated;
GRANT ALL ON positions TO anon;
GRANT ALL ON positions TO service_role;

-- Grant all permissions on strategies table
GRANT ALL ON strategies TO authenticated;
GRANT ALL ON strategies TO anon;
GRANT ALL ON strategies TO service_role;

-- ========================================
-- 5. GRANT USAGE ON SEQUENCES (for auto-increment IDs if any)
-- ========================================

-- This is needed if you have sequences for IDs
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ========================================
-- 6. VERIFY PERMISSIONS
-- ========================================

-- Check RLS status
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('trades', 'positions', 'strategies');

-- Check grants
SELECT 
  table_name,
  privilege_type,
  grantee
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('trades', 'positions', 'strategies')
ORDER BY table_name, grantee, privilege_type;

-- ========================================
-- 7. OPTIONAL: IF YOU WANT TO ENABLE RLS WITH PERMISSIVE POLICIES
-- (Uncomment this section if you want RLS enabled but with open policies)
-- ========================================

/*
-- Enable RLS but with permissive policies
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations for authenticated users
CREATE POLICY "Allow all operations on trades" ON trades
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on positions" ON positions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on strategies" ON strategies
  FOR ALL
  USING (true)
  WITH CHECK (true);
*/

-- ========================================
-- DONE! 
-- Your tables should now be editable in Supabase dashboard
-- ========================================

