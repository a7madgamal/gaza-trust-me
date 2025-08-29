-- Migration: 021_add_facebook_and_telegram_links.sql
-- Description: Add Facebook profile and Telegram link fields to users table
-- Created: 2025-01-27
-- Add Facebook profile and Telegram link fields to users table
ALTER TABLE public.users
ADD COLUMN facebook_url TEXT,
ADD COLUMN telegram_url TEXT;


-- Add comments for documentation
COMMENT ON COLUMN public.users.facebook_url IS 'Optional Facebook profile URL for help seekers';


COMMENT ON COLUMN public.users.telegram_url IS 'Optional Telegram profile URL for help seekers';
