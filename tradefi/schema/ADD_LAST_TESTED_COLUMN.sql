-- =====================================================
-- ADD last_tested COLUMN TO bot_credentials
-- =====================================================
-- This column stores when the credentials were last successfully tested
-- Run this in Supabase SQL Editor

ALTER TABLE public.bot_credentials 
ADD COLUMN IF NOT EXISTS last_tested timestamp with time zone NULL;

CREATE INDEX IF NOT EXISTS idx_bot_credentials_last_tested 
ON public.bot_credentials(last_tested DESC);

