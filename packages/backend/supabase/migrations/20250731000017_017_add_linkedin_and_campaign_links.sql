-- Migration: 017_add_linkedin_and_campaign_links.sql
-- Description: Add LinkedIn and campaign link fields to users table
-- Created: 2025-01-27
-- Add LinkedIn and campaign link fields to users table
ALTER TABLE public.users
ADD COLUMN linkedin_url TEXT,
ADD COLUMN campaign_url TEXT;


-- Add comments for documentation
COMMENT ON COLUMN public.users.linkedin_url IS 'Optional LinkedIn profile URL for help seekers';


COMMENT ON COLUMN public.users.campaign_url IS 'Optional campaign or fundraising URL for help seekers';


-- Add indexes for performance (optional, since these are likely to be sparse)
CREATE INDEX IF NOT EXISTS idx_users_linkedin_url ON public.users (linkedin_url)
WHERE
  linkedin_url IS NOT NULL;


CREATE INDEX IF NOT EXISTS idx_users_campaign_url ON public.users (campaign_url)
WHERE
  campaign_url IS NOT NULL;
