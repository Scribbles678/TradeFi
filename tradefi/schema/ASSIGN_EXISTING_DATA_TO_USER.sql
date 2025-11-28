-- =====================================================
-- ASSIGN EXISTING DATA TO USER
-- =====================================================
-- This script assigns all existing records to your user account
-- Run this AFTER running FIX_TRADIER_OPTION_TRADES.sql
-- 
-- Your User ID: e0470a70-f1f7-46bd-933f-b34afbcdb940
-- =====================================================

-- Set your user ID
DO $$
DECLARE
  my_user_id UUID := 'e0470a70-f1f7-46bd-933f-b34afbcdb940';
BEGIN
  -- Update trades table
  UPDATE public.trades
  SET user_id = my_user_id
  WHERE user_id IS NULL;
  
  -- Update strategies table
  UPDATE public.strategies
  SET user_id = my_user_id
  WHERE user_id IS NULL;
  
  -- Update positions table
  UPDATE public.positions
  SET user_id = my_user_id
  WHERE user_id IS NULL;
  
  -- Update bot_credentials table
  UPDATE public.bot_credentials
  SET user_id = my_user_id
  WHERE user_id IS NULL;
  
  -- Update trade_settings_global table
  UPDATE public.trade_settings_global
  SET user_id = my_user_id
  WHERE user_id IS NULL;
  
  -- Update trade_settings_exchange table
  UPDATE public.trade_settings_exchange
  SET user_id = my_user_id
  WHERE user_id IS NULL;
  
  -- Update tradier_option_trades table
  UPDATE public.tradier_option_trades
  SET user_id = my_user_id
  WHERE user_id IS NULL;
  
  RAISE NOTICE 'All existing records have been assigned to user: %', my_user_id;
END $$;

-- Verify the updates
SELECT 
  'trades' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE user_id = 'e0470a70-f1f7-46bd-933f-b34afbcdb940') as your_records,
  COUNT(*) FILTER (WHERE user_id IS NULL) as null_records
FROM public.trades
UNION ALL
SELECT 
  'strategies' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE user_id = 'e0470a70-f1f7-46bd-933f-b34afbcdb940') as your_records,
  COUNT(*) FILTER (WHERE user_id IS NULL) as null_records
FROM public.strategies
UNION ALL
SELECT 
  'positions' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE user_id = 'e0470a70-f1f7-46bd-933f-b34afbcdb940') as your_records,
  COUNT(*) FILTER (WHERE user_id IS NULL) as null_records
FROM public.positions
UNION ALL
SELECT 
  'bot_credentials' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE user_id = 'e0470a70-f1f7-46bd-933f-b34afbcdb940') as your_records,
  COUNT(*) FILTER (WHERE user_id IS NULL) as null_records
FROM public.bot_credentials
UNION ALL
SELECT 
  'trade_settings_global' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE user_id = 'e0470a70-f1f7-46bd-933f-b34afbcdb940') as your_records,
  COUNT(*) FILTER (WHERE user_id IS NULL) as null_records
FROM public.trade_settings_global
UNION ALL
SELECT 
  'trade_settings_exchange' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE user_id = 'e0470a70-f1f7-46bd-933f-b34afbcdb940') as your_records,
  COUNT(*) FILTER (WHERE user_id IS NULL) as null_records
FROM public.trade_settings_exchange
UNION ALL
SELECT 
  'tradier_option_trades' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE user_id = 'e0470a70-f1f7-46bd-933f-b34afbcdb940') as your_records,
  COUNT(*) FILTER (WHERE user_id IS NULL) as null_records
FROM public.tradier_option_trades;

