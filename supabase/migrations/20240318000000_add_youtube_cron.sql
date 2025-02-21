
-- Enable the pg_cron and pg_net extensions if they're not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create or replace the api_quota_tracking table
CREATE TABLE IF NOT EXISTS public.api_quota_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_name TEXT NOT NULL,
    quota_limit INTEGER NOT NULL,
    quota_remaining INTEGER NOT NULL,
    quota_reset_at TIMESTAMPTZ NOT NULL,
    last_reset TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert initial YouTube quota if not exists
INSERT INTO public.api_quota_tracking (api_name, quota_limit, quota_remaining, quota_reset_at, last_reset)
SELECT 
    'youtube',
    10000,
    10000,
    (NOW() + INTERVAL '1 day')::date + INTERVAL '24 hours',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.api_quota_tracking WHERE api_name = 'youtube'
);

-- Drop existing schedule if it exists
SELECT cron.unschedule('fetch-youtube-videos');
SELECT cron.unschedule('reset-youtube-quota');

-- Schedule quota reset job to run daily at midnight UTC
SELECT cron.schedule(
    'reset-youtube-quota',
    '0 0 * * *',  -- At 00:00 (midnight) every day
    $$
    UPDATE public.api_quota_tracking 
    SET 
        quota_remaining = quota_limit,
        quota_reset_at = (NOW() + INTERVAL '1 day')::date + INTERVAL '24 hours',
        last_reset = NOW(),
        updated_at = NOW()
    WHERE api_name = 'youtube';
    $$
);

-- Schedule the video fetch function
SELECT cron.schedule(
    'fetch-youtube-videos',
    '*/15 * * * *',
    $$
    -- Call the trigger_youtube_video_fetch function which handles quota management
    SELECT public.trigger_youtube_video_fetch();
    $$
);

-- Add logging for job execution
CREATE TABLE IF NOT EXISTS public.cron_job_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name TEXT NOT NULL,
    status TEXT NOT NULL,
    response JSON,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure proper permissions
ALTER TABLE public.api_quota_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cron_job_logs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE ON public.api_quota_tracking TO postgres, anon, authenticated, service_role;
GRANT SELECT, INSERT ON public.cron_job_logs TO postgres, anon, authenticated, service_role;

-- Create policies
CREATE POLICY "Allow manage api_quota_tracking" ON public.api_quota_tracking
FOR ALL TO postgres, anon, authenticated, service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow insert cron_job_logs" ON public.cron_job_logs
FOR INSERT TO postgres, anon, authenticated, service_role
WITH CHECK (true);

CREATE POLICY "Allow view cron_job_logs" ON public.cron_job_logs
FOR SELECT TO postgres, anon, authenticated, service_role
USING (true);
