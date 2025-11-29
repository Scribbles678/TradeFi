-- =====================================================
-- WEBHOOK REQUESTS TABLE
-- =====================================================
-- Tracks all webhook requests for subscription limits and analytics
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.webhook_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  webhook_secret text, -- The secret used (for verification)
  exchange text, -- Exchange name (aster, oanda, tradier, etc.)
  action text, -- Action type (buy, sell, etc.)
  symbol text, -- Trading symbol
  payload jsonb, -- Full webhook payload for debugging
  status text NOT NULL DEFAULT 'pending', -- pending, processed, failed, rate_limited
  error_message text, -- Error details if status is 'failed'
  processed_at timestamp with time zone, -- When the webhook was processed
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT webhook_requests_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_requests_user_id ON public.webhook_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_requests_created_at ON public.webhook_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_requests_user_created ON public.webhook_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_requests_status ON public.webhook_requests(status);

-- Enable Row Level Security
ALTER TABLE public.webhook_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own webhook requests
CREATE POLICY "Users can view their own webhook requests"
  ON public.webhook_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert webhook requests (for the webhook endpoint)
CREATE POLICY "Service role can insert webhook requests"
  ON public.webhook_requests
  FOR INSERT
  WITH CHECK (true); -- Webhook endpoint will use service role

-- Service role can update webhook requests
CREATE POLICY "Service role can update webhook requests"
  ON public.webhook_requests
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Function to get monthly webhook count for a user
CREATE OR REPLACE FUNCTION public.get_user_webhook_count_this_month(p_user_id uuid)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)
  FROM public.webhook_requests
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('month', CURRENT_DATE)
    AND status != 'rate_limited';
$$;

-- Function to check if user has exceeded webhook limit
CREATE OR REPLACE FUNCTION public.check_webhook_limit(
  p_user_id uuid,
  p_plan text DEFAULT 'Free'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_count bigint;
  v_limit bigint;
BEGIN
  -- Get current month's webhook count
  SELECT get_user_webhook_count_this_month(p_user_id) INTO v_current_count;
  
  -- Set limit based on plan
  CASE p_plan
    WHEN 'Pro' THEN v_limit := 999999999; -- Effectively unlimited
    WHEN 'Premium' THEN v_limit := 5000;
    WHEN 'Basic' THEN v_limit := 1000;
    ELSE v_limit := 5; -- Free tier
  END CASE;
  
  -- Return true if under limit, false if exceeded
  RETURN v_current_count < v_limit;
END;
$$;

