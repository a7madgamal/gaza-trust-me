-- Migration: 001_initial_schema.sql
-- Description: Initial database schema for help-seeking platform
-- Created: 2025-07-30
-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom enum types
CREATE TYPE user_role AS ENUM ('help_seeker', 'admin', 'super_admin');

CREATE TYPE seeker_status AS ENUM ('pending', 'verified', 'flagged');

CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users (id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    role USER_ROLE NOT NULL DEFAULT 'help_seeker',
    -- Seeker-specific fields (for help_seeker role)
    title TEXT,
    description TEXT,
    urgency_level URGENCY_LEVEL DEFAULT 'medium',
    location TEXT,
    contact_preference TEXT, -- 'gofundme' or 'whatsapp'
    contact_value TEXT, -- GoFundMe link or WhatsApp number
    status SEEKER_STATUS DEFAULT 'pending',
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES public.users (id),
    flagged_at TIMESTAMP WITH TIME ZONE,
    flagged_by UUID REFERENCES public.users (id),
    flag_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- User images table
CREATE TABLE IF NOT EXISTS public.user_images (
    id UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY,
    user_id UUID REFERENCES public.users (id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    storage_bucket TEXT NOT NULL DEFAULT 'user-images',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin actions table for tracking verification/flagging actions
CREATE TABLE IF NOT EXISTS public.admin_actions (
    id UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY,
    admin_id UUID REFERENCES public.users (id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users (id) ON DELETE CASCADE NOT NULL,
    action_type TEXT NOT NULL, -- 'verify', 'flag', 'remark'
    action_data JSONB, -- Additional data like remarks, reasons, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table for comprehensive system tracking
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY,
    user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL, -- 'user', 'admin_action', etc.
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);

CREATE INDEX IF NOT EXISTS idx_users_status ON public.users (status);

CREATE INDEX IF NOT EXISTS idx_users_urgency ON public.users (urgency_level);

CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users (created_at);

CREATE INDEX IF NOT EXISTS idx_user_images_user_id ON public.user_images (
    user_id
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON public.admin_actions (
    admin_id
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_user_id ON public.admin_actions (
    user_id
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs (
    user_id
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (
    created_at
);
