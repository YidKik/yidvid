-- Add digest_frequency column to email_preferences
ALTER TABLE public.email_preferences 
ADD COLUMN IF NOT EXISTS digest_frequency text DEFAULT NULL;

-- Add last_digest_sent_at to track when last digest was sent
ALTER TABLE public.email_preferences 
ADD COLUMN IF NOT EXISTS last_digest_sent_at timestamp with time zone DEFAULT NULL;

-- Change default for new_video_emails to false for new users
ALTER TABLE public.email_preferences 
ALTER COLUMN new_video_emails SET DEFAULT false;

-- Set all existing users to off (opt-in fresh)
UPDATE public.email_preferences SET new_video_emails = false WHERE new_video_emails = true;