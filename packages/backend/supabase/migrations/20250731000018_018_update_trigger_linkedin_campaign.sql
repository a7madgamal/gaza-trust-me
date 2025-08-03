-- Migration: 018_update_trigger_linkedin_campaign.sql
-- Description: Update handle_new_user function to handle LinkedIn and campaign URL fields
-- Created: 2025-01-27
-- Drop and recreate the function to include LinkedIn and campaign URL fields
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;


DROP FUNCTION IF EXISTS public.handle_new_user ();


CREATE OR REPLACE FUNCTION public.handle_new_user () RETURNS TRIGGER AS $$
BEGIN
    -- Only create profile if full_name is provided in metadata
    IF NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
        INSERT INTO public.users (id, email, full_name, phone_number, role, description, linkedin_url, campaign_url)
        VALUES (
            NEW.id,
            NEW.email,
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'phone_number',
            'help_seeker',
            NEW.raw_user_meta_data->>'description',
            NEW.raw_user_meta_data->>'linkedin_url',
            NEW.raw_user_meta_data->>'campaign_url'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user ();
