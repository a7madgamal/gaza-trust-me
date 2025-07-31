-- Migration: 004_remove_fallbacks.sql
-- Description: Remove fallback values and make fields required
-- Created: 2025-07-31

-- Drop the existing trigger and function that uses fallbacks
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function without fallbacks - let it fail if data is missing
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
    -- Only create profile if full_name is provided in metadata
    IF NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
        INSERT INTO public.users (id, email, full_name, phone_number, role)
        VALUES (
            NEW.id,
            NEW.email,
            NEW.raw_user_meta_data->>'full_name',
            'PENDING_UPDATE',
            'help_seeker'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- First, update existing users with NULL phone_number to have a placeholder
UPDATE public.users SET phone_number = 'PENDING_UPDATE'
WHERE phone_number IS NULL;

-- Now make phone_number required
ALTER TABLE public.users ALTER COLUMN phone_number SET NOT NULL;

-- Add check constraint to ensure phone_number is not empty
ALTER TABLE public.users ADD CONSTRAINT users_phone_number_not_empty
CHECK (phone_number != '' AND phone_number IS NOT NULL);

-- Add check constraint to ensure full_name is not empty
ALTER TABLE public.users ADD CONSTRAINT users_full_name_not_empty
CHECK (full_name != '' AND full_name IS NOT NULL);

-- Add check constraint to ensure email is not empty
ALTER TABLE public.users ADD CONSTRAINT users_email_not_empty
CHECK (email != '' AND email IS NOT NULL);
