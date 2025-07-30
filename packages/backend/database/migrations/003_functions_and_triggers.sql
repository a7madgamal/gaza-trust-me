-- Migration: 003_functions_and_triggers.sql
-- Description: Database functions and triggers for automatic updates and audit logging
-- Created: 2025-07-30
-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON public.users FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Function for audit logging
CREATE OR REPLACE FUNCTION log_audit_event() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values
    ) VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for audit logging
CREATE TRIGGER audit_users_changes
AFTER INSERT
OR
UPDATE
OR DELETE ON public.users FOR EACH ROW
EXECUTE FUNCTION log_audit_event();


CREATE TRIGGER audit_admin_actions_changes
AFTER INSERT
OR
UPDATE
OR DELETE ON public.admin_actions FOR EACH ROW
EXECUTE FUNCTION log_audit_event();

-- Function to create user profile after auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
        'help_seeker'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
