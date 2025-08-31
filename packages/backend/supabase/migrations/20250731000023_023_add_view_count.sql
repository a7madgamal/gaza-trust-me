-- Migration: 023_add_view_count.sql
-- Description: Add view_count column to users table for fair homepage card sorting
-- Created: 2025-01-27
-- Add view_count column to users table
ALTER TABLE public.users
ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;


-- Create index on view_count for performance
CREATE INDEX idx_users_view_count ON public.users (view_count);


-- Update all existing users to have view_count = 0
UPDATE public.users
SET
  view_count = 0
WHERE
  view_count IS NULL;


-- Add comment to document the column purpose
COMMENT ON COLUMN public.users.view_count IS 'Number of times this user profile has been viewed on the homepage';
