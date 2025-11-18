-- =====================================================
-- PHASE 1: ADD USER_ID COLUMNS TO ALL TABLES
-- =====================================================

-- Add user_id to strategies table
ALTER TABLE public.strategies 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to trades table
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to positions table
ALTER TABLE public.positions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to bot_credentials table (if it exists)
ALTER TABLE public.bot_credentials 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to trade_settings_global table (if it exists)
ALTER TABLE public.trade_settings_global 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to trade_settings_exchange table (if it exists)
ALTER TABLE public.trade_settings_exchange 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- =====================================================
-- PHASE 2: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_strategies_user_id ON public.strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_user_id ON public.positions(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_credentials_user_id ON public.bot_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_settings_global_user_id ON public.trade_settings_global(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_settings_exchange_user_id ON public.trade_settings_exchange(user_id);

-- =====================================================
-- PHASE 3: ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_settings_global ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_settings_exchange ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PHASE 4: CREATE RLS POLICIES
-- =====================================================

-- STRATEGIES POLICIES
CREATE POLICY "Users can view their own strategies"
  ON public.strategies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own strategies"
  ON public.strategies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strategies"
  ON public.strategies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strategies"
  ON public.strategies FOR DELETE
  USING (auth.uid() = user_id);

-- TRADES POLICIES
CREATE POLICY "Users can view their own trades"
  ON public.trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades"
  ON public.trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades"
  ON public.trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades"
  ON public.trades FOR DELETE
  USING (auth.uid() = user_id);

-- POSITIONS POLICIES
CREATE POLICY "Users can view their own positions"
  ON public.positions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own positions"
  ON public.positions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own positions"
  ON public.positions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own positions"
  ON public.positions FOR DELETE
  USING (auth.uid() = user_id);

-- BOT_CREDENTIALS POLICIES
CREATE POLICY "Users can view their own credentials"
  ON public.bot_credentials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credentials"
  ON public.bot_credentials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credentials"
  ON public.bot_credentials FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credentials"
  ON public.bot_credentials FOR DELETE
  USING (auth.uid() = user_id);

-- TRADE_SETTINGS_GLOBAL POLICIES
CREATE POLICY "Users can view their own global settings"
  ON public.trade_settings_global FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own global settings"
  ON public.trade_settings_global FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own global settings"
  ON public.trade_settings_global FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own global settings"
  ON public.trade_settings_global FOR DELETE
  USING (auth.uid() = user_id);

-- TRADE_SETTINGS_EXCHANGE POLICIES
CREATE POLICY "Users can view their own exchange settings"
  ON public.trade_settings_exchange FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exchange settings"
  ON public.trade_settings_exchange FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exchange settings"
  ON public.trade_settings_exchange FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exchange settings"
  ON public.trade_settings_exchange FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- PHASE 5: CREATE USER PROFILES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- PHASE 6: CREATE FUNCTION TO AUTO-CREATE USER PROFILE
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Run this migration in your Supabase SQL Editor
-- 2. After running, existing data will have NULL user_id
-- 3. You'll need to manually assign existing data to a user
-- 4. Or you can delete existing data and start fresh
-- 5. Make sure Supabase Auth is enabled in your project
-- =====================================================

