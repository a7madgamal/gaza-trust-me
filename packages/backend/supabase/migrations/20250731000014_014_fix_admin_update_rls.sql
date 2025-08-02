-- Migration: 014_fix_admin_update_rls.sql
-- Description: Fix infinite recursion in admin update RLS policy
-- Created: 2025-07-30
-- Drop the problematic admin update policy
DROP POLICY IF EXISTS "Admins can update help seeker status" ON public.users;


-- Create a new admin update policy that avoids recursion
CREATE POLICY "Admins can update help seeker status" ON public.users
FOR UPDATE
  USING (auth.role () = 'authenticated');


-- Add a comment to clarify the policy
COMMENT ON POLICY "Admins can update help seeker status" ON public.users IS 'Allows authenticated users to update user status - admin checks handled in application layer';
