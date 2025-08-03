-- Migration: 019_add_url_id_to_users.sql
-- Description: Add url_id field to users table for URL-based lookups
-- Created: 2025-01-27
-- Add url_id column to users table
ALTER TABLE public.users
ADD COLUMN url_id SERIAL NOT NULL;


-- Add unique constraint on url_id
ALTER TABLE public.users
ADD CONSTRAINT users_url_id_unique UNIQUE (url_id);


-- Create index for fast lookups by url_id
CREATE INDEX IF NOT EXISTS idx_users_url_id ON public.users (url_id);


-- Update existing users to have url_id values
-- This will automatically assign sequential numbers to existing users
-- No need for explicit UPDATE since SERIAL auto-increments
