-- Migration: 002_rls_policies.sql
-- Description: Row Level Security policies for all tables
-- Created: 2025-07-30
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_images ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users FOR
SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Anyone can view verified help seekers" ON public.users FOR
SELECT
USING (role = 'help_seeker' AND status = 'verified');

CREATE POLICY "Admins can view all users" ON public.users FOR
SELECT
USING (
    EXISTS (
        SELECT 1
        FROM
            public.users
        WHERE
            id = auth.uid()
            AND role IN ('admin', 'super_admin')
    )
);

-- Help seeker policies (for users with help_seeker role)
CREATE POLICY "Help seekers can update their own pending profile" ON public.users
FOR UPDATE
USING (
    auth.uid() = id
    AND role = 'help_seeker'
    AND status = 'pending'
);

CREATE POLICY "Admins can update help seeker status" ON public.users
FOR UPDATE
USING (
    EXISTS (
        SELECT 1
        FROM
            public.users
        WHERE
            id = auth.uid()
            AND role IN ('admin', 'super_admin')
    )
);

-- User images policies
CREATE POLICY "Anyone can view images for verified help seekers" ON public.user_images FOR
SELECT
USING (
    EXISTS (
        SELECT 1
        FROM
            public.users
        WHERE
            id = user_id
            AND role = 'help_seeker'
            AND status = 'verified'
    )
);

CREATE POLICY "Users can view their own images" ON public.user_images FOR
SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can upload their own images" ON public.user_images FOR INSERT
WITH
CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all user images" ON public.user_images FOR
SELECT
USING (
    EXISTS (
        SELECT 1
        FROM
            public.users
        WHERE
            id = auth.uid()
            AND role IN ('admin', 'super_admin')
    )
);

-- Admin actions policies
CREATE POLICY "Admins can view admin actions" ON public.admin_actions FOR
SELECT
USING (
    EXISTS (
        SELECT 1
        FROM
            public.users
        WHERE
            id = auth.uid()
            AND role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "Admins can create admin actions" ON public.admin_actions FOR INSERT
WITH
CHECK (
    EXISTS (
        SELECT 1
        FROM
            public.users
        WHERE
            id = auth.uid()
            AND role IN ('admin', 'super_admin')
    )
);

-- Audit logs policies (super admin only)
CREATE POLICY "Super admins can view audit logs" ON public.audit_logs FOR
SELECT
USING (
    EXISTS (
        SELECT 1
        FROM
            public.users
        WHERE
            id = auth.uid()
            AND role = 'super_admin'
    )
);
