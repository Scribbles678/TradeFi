-- =====================================================
-- SUBSCRIPTIONS TABLE
-- =====================================================
-- Professional subscription management with billing integration
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription Details
  plan text NOT NULL DEFAULT 'Free', -- 'Free', 'Basic', 'Premium', 'Pro'
  status text NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'past_due', 'trialing', 'incomplete'
  
  -- Billing Integration (Stripe)
  stripe_subscription_id text, -- Stripe subscription ID
  stripe_customer_id text, -- Stripe customer ID
  stripe_price_id text, -- Stripe price/plan ID
  
  -- Billing Period
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamp with time zone,
  
  -- Trial Information
  trial_start timestamp with time zone,
  trial_end timestamp with time zone,
  
  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb, -- Additional subscription data
  
  -- Timestamps
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_user_id_key UNIQUE (user_id) -- One active subscription per user
) TABLESPACE pg_default;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own subscription
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all subscriptions (for webhooks, admin, etc.)
CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to get user's active subscription plan
CREATE OR REPLACE FUNCTION public.get_user_subscription_plan(p_user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT plan
  FROM public.subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;
$$;

-- Function to get user's subscription with fallback to 'Free'
CREATE OR REPLACE FUNCTION public.get_user_subscription_plan_safe(p_user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT plan
     FROM public.subscriptions
     WHERE user_id = p_user_id
       AND status = 'active'
     ORDER BY created_at DESC
     LIMIT 1),
    'Free'
  );
$$;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_subscriptions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscriptions_updated_at();

-- Insert default Free subscription for existing users (optional migration)
-- Uncomment if you want to create Free subscriptions for all existing users
/*
INSERT INTO public.subscriptions (user_id, plan, status)
SELECT id, 'Free', 'active'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.subscriptions)
ON CONFLICT (user_id) DO NOTHING;
*/

