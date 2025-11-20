-- =====================================================
-- BOT_CREDENTIALS ENVIRONMENT MIGRATION
-- =====================================================
-- This migration enables storing separate Live and Paper 
-- credentials for each exchange by adding a unique 
-- constraint on (user_id, exchange, environment)
-- =====================================================

-- Step 1: Ensure the bot_credentials table exists with proper structure
CREATE TABLE IF NOT EXISTS public.bot_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange TEXT NOT NULL,
  label TEXT,
  environment TEXT DEFAULT 'production',
  account_id TEXT,
  api_key TEXT,
  api_secret TEXT,
  passphrase TEXT,
  webhook_secret TEXT,
  extra_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Drop the old constraint if it exists (user_id + exchange only)
-- This allows us to store multiple credentials per exchange (one per environment)
ALTER TABLE public.bot_credentials 
DROP CONSTRAINT IF EXISTS bot_credentials_user_exchange_unique;

-- Step 3: Add new unique constraint on (user_id, exchange, environment)
-- This ensures each user can have ONE credential per exchange per environment
ALTER TABLE public.bot_credentials 
ADD CONSTRAINT bot_credentials_user_exchange_env_unique 
UNIQUE (user_id, exchange, environment);

-- Step 4: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bot_credentials_user_exchange_env 
ON public.bot_credentials(user_id, exchange, environment);

-- Step 5: Ensure RLS is enabled (if not already)
ALTER TABLE public.bot_credentials ENABLE ROW LEVEL SECURITY;

-- Step 6: Ensure RLS policies exist (these should already exist from auth_migration.sql)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bot_credentials' 
    AND policyname = 'Users can view their own credentials'
  ) THEN
    CREATE POLICY "Users can view their own credentials"
      ON public.bot_credentials FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bot_credentials' 
    AND policyname = 'Users can insert their own credentials'
  ) THEN
    CREATE POLICY "Users can insert their own credentials"
      ON public.bot_credentials FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bot_credentials' 
    AND policyname = 'Users can update their own credentials'
  ) THEN
    CREATE POLICY "Users can update their own credentials"
      ON public.bot_credentials FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bot_credentials' 
    AND policyname = 'Users can delete their own credentials'
  ) THEN
    CREATE POLICY "Users can delete their own credentials"
      ON public.bot_credentials FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- =====================================================
-- MIGRATION NOTES:
-- =====================================================
-- 1. This migration is SAFE to run multiple times (idempotent)
-- 2. Existing credentials will remain unchanged
-- 3. Users can now save separate credentials for:
--    - production (Live trading)
--    - practice (Paper trading)
--    - sandbox (Testing)
-- 4. The frontend will load/save credentials based on the 
--    current environment toggle state
-- =====================================================

