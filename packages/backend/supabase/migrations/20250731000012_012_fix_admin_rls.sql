-- Migration: 012_fix_admin_rls.sql
-- Description: Fix admin RLS policy to ensure admins can view all users
-- Created: 2025-07-30
-- Drop the existing admin policy
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;


-- Create a new admin policy that explicitly allows viewing all users
CREATE POLICY "Admins can view all users" ON public.users FOR
SELECT
  USING (
    EXISTS (
      SELECT
        1
      FROM
        public.users
      WHERE
        id = auth.uid ()
        AND role IN ('admin', 'super_admin')
    )
  );


-- Add a comment to clarify the policy
COMMENT ON POLICY "Admins can view all users" ON public.users IS 'Allows admins and super admins to view all users regardless of status';
