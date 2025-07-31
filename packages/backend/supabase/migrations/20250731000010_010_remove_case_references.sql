-- Migration: 010_remove_case_references.sql
-- Description: Remove case-related references and clean up schema comments
-- Created: 2025-07-31
-- Update table comments to reflect user profile focus instead of case management
COMMENT ON TABLE public.users IS 'User profiles and account information';


COMMENT ON TABLE public.user_images IS 'Profile images for users';


COMMENT ON TABLE public.admin_actions IS 'Admin actions on user profiles (verification, flagging)';


COMMENT ON TABLE public.audit_logs IS 'System audit logs for all user and admin actions';


-- Update column comments to reflect user profile focus
COMMENT ON COLUMN public.users.description IS 'User profile description';


COMMENT ON COLUMN public.users.status IS 'User profile verification status';


COMMENT ON COLUMN public.users.verified_at IS 'When user profile was verified';


COMMENT ON COLUMN public.users.verified_by IS 'Admin who verified the user profile';


COMMENT ON COLUMN public.admin_actions.action_type IS 'Type of admin action (verify, flag, remark)';


COMMENT ON COLUMN public.admin_actions.action_data IS 'Additional data for the action (remarks, reasons, etc.)';


-- Update enum type comments
COMMENT ON TYPE user_role IS 'User roles: help_seeker, admin, super_admin';


COMMENT ON TYPE seeker_status IS 'User profile verification status: pending, verified, flagged';


-- Clean up any case-related function comments (if they exist)
DO $$
BEGIN
    -- Update function comments if they contain case references
    -- This is a safe operation that won't fail if comments don't exist
    EXECUTE 'COMMENT ON FUNCTION public.handle_new_user() IS ''Create user profile after auth signup''';
    EXECUTE 'COMMENT ON FUNCTION public.log_audit_event() IS ''Log audit events for user and admin actions''';
    EXECUTE 'COMMENT ON FUNCTION public.update_updated_at_column() IS ''Update updated_at timestamp automatically''';
EXCEPTION
    WHEN OTHERS THEN
        -- Function comments might not exist, which is fine
        NULL;
END $$;


-- Verify no case-related tables exist (safety check)
DO $$
DECLARE
    case_table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO case_table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE '%case%';
    
    IF case_table_count > 0 THEN
        RAISE EXCEPTION 'Found % case-related tables that need to be removed', case_table_count;
    END IF;
END $$;


-- Verify no case-related columns exist (safety check)
DO $$
DECLARE
    case_column_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO case_column_count
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND column_name LIKE '%case%';
    
    IF case_column_count > 0 THEN
        RAISE EXCEPTION 'Found % case-related columns that need to be removed', case_column_count;
    END IF;
END $$;
