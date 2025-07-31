-- Migration: 009_make_phone_number_required.sql
-- Description: Make phone_number NOT NULL to match business requirements
-- Created: 2025-07-31

-- First, update any existing NULL phone_number values to a default value
-- This ensures we don't break existing data
UPDATE public.users
SET phone_number = 'Not provided'
WHERE phone_number IS NULL;

-- Now make the column NOT NULL
ALTER TABLE public.users
ALTER COLUMN phone_number SET NOT NULL;
