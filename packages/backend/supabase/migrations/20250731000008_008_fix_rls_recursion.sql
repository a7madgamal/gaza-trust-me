-- Migration: 008_fix_rls_recursion.sql
-- Description: Fix infinite recursion in RLS policies
-- Created: 2025-07-31
-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;


DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;


DROP POLICY IF EXISTS "Anyone can view verified help seekers" ON public.users;


DROP POLICY IF EXISTS "Admins can view all users" ON public.users;


DROP POLICY IF EXISTS "Help seekers can update their own pending profile" ON public.users;


DROP POLICY IF EXISTS "Admins can update help seeker status" ON public.users;


-- Recreate policies without infinite recursion
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.users FOR
SELECT
  USING (auth.uid () = id);


-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.users
FOR UPDATE
  USING (auth.uid () = id);


-- Anyone can view verified help seekers (no recursion)
CREATE POLICY "Anyone can view verified help seekers" ON public.users FOR
SELECT
  USING (
    role = 'help_seeker'
    AND status = 'verified'
  );


-- Admins can view all users (using auth.jwt() instead of querying users table)
CREATE POLICY "Admins can view all users" ON public.users FOR
SELECT
  USING (
    (auth.jwt () ->> 'role')::TEXT IN ('admin', 'super_admin')
  );


-- Help seekers can update their own pending profile
CREATE POLICY "Help seekers can update their own pending profile" ON public.users
FOR UPDATE
  USING (
    auth.uid () = id
    AND role = 'help_seeker'
    AND status = 'pending'
  );


-- Admins can update help seeker status (using auth.jwt() instead of querying users table)
CREATE POLICY "Admins can update help seeker status" ON public.users
FOR UPDATE
  USING (
    (auth.jwt () ->> 'role')::TEXT IN ('admin', 'super_admin')
  );
