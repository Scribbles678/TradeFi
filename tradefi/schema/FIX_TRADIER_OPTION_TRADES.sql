-- =====================================================
-- FIX: Add Multi-Tenancy to tradier_option_trades
-- =====================================================
-- This table was missing user_id and RLS policies
-- Run this in Supabase SQL Editor

-- Add user_id column
ALTER TABLE public.tradier_option_trades 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index for performance
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

