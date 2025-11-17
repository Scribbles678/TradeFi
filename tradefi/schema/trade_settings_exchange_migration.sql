-- Migration: Remove news_filter and notes columns
-- Also remove redundant tp_percent and sl_percent columns (using take_profit_percent and stop_loss_percent instead)

-- Remove news_filter column
ALTER TABLE public.trade_settings_exchange 
DROP COLUMN IF EXISTS news_filter;

-- Remove notes column
ALTER TABLE public.trade_settings_exchange 
DROP COLUMN IF EXISTS notes;

-- Remove redundant tp_percent column (using take_profit_percent instead)
ALTER TABLE public.trade_settings_exchange 
DROP COLUMN IF EXISTS tp_percent;

-- Remove redundant sl_percent column (using stop_loss_percent instead)
ALTER TABLE public.trade_settings_exchange 
DROP COLUMN IF EXISTS sl_percent;

