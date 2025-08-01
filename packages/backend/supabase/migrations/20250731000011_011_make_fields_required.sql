-- Migration: 011_make_fields_required.sql
-- Description: Make phone_number and description non-nullable fields
-- Created: 2025-07-31
-- First, update any existing NULL values to have default values
UPDATE public.users
SET
  phone_number = 'No phone provided'
WHERE
  phone_number IS NULL;


UPDATE public.users
SET
  description = 'No description provided'
WHERE
  description IS NULL;


-- Now make the columns non-nullable
ALTER TABLE public.users
ALTER COLUMN phone_number
SET NOT NULL,
ALTER COLUMN description
SET NOT NULL;
