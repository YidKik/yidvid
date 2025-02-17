
-- Enable the pg_cron and pg_net extensions if they're not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Drop existing schedule if it exists
SELECT cron.unschedule('fetch-youtube-videos');

-- Schedule the function to run every 15 minutes
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
ALTER TABLE public.cron_job_logs ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.cron_job_logs TO postgres, anon, authenticated, service_role;

-- Create policy to allow inserting logs
CREATE POLICY "Allow insert cron_job_logs" ON public.cron_job_logs
FOR INSERT TO postgres, anon, authenticated, service_role
WITH CHECK (true);

-- Create policy to allow viewing logs
CREATE POLICY "Allow view cron_job_logs" ON public.cron_job_logs
FOR SELECT TO postgres, anon, authenticated, service_role
USING (true);
