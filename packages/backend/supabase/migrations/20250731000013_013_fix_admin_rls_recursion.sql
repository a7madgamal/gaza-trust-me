-- Migration: 013_fix_admin_rls_recursion.sql
-- Description: Fix infinite recursion in admin RLS policy
-- Created: 2025-07-30
-- Drop the problematic admin policy
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;


-- Create a new admin policy that allows all authenticated users to view users
-- This avoids recursion and we'll handle admin checks in the application layer
CREATE POLICY "Authenticated users can view all users" ON public.users FOR
SELECT
  USING (auth.role () = 'authenticated');


-- Add a comment to clarify the policy
COMMENT ON POLICY "Authenticated users can view all users" ON public.users IS 'Allows authenticated users to view all users - admin checks handled in application layer';
