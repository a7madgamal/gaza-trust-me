-- Migration: 016_fix_audit_logs_insert.sql
-- Description: Fix audit_logs INSERT policy to allow trigger function to work
-- Created: 2025-07-30
-- Add INSERT policy for audit_logs to allow trigger function to work
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT
WITH
  CHECK (TRUE);


-- Add a comment to clarify the policy
COMMENT ON POLICY "System can insert audit logs" ON public.audit_logs IS 'Allows system triggers to insert audit logs';
