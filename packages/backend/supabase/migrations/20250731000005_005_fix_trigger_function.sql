-- Migration: 005_fix_trigger_function.sql
-- Description: Fix the handle_new_user function to include phone_number
-- Created: 2025-07-31
-- Drop and recreate the function with phone_number
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;


DROP FUNCTION IF EXISTS public.handle_new_user ();


CREATE OR REPLACE FUNCTION public.handle_new_user () RETURNS TRIGGER AS $$
BEGIN
    -- Only create profile if full_name is provided in metadata
    IF NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
        INSERT INTO public.users (id, email, full_name, phone_number, role)
        VALUES (
            NEW.id,
            NEW.email,
            NEW.raw_user_meta_data->>'full_name',
            COALESCE(NEW.raw_user_meta_data->>'phone_number', 'PENDING_UPDATE'),
            'help_seeker'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user ();
