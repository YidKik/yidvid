-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove any existing cron jobs to avoid duplicates
SELECT cron.unschedule(jobid) 
FROM cron.job 
WHERE jobname IN (
  'daily-fetch-youtube-videos',
  'daily-update-video-views',
  'fetch-youtube-videos',
  'fetch-active-channels',
  'update-video-views',
  'reset-youtube-quota'
);

-- Schedule daily YouTube video fetch at 2:00 AM UTC
-- This will fetch videos from ALL active channels once per day
SELECT cron.schedule(
  'daily-fetch-youtube-videos',
  '0 2 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/fetch-youtube-videos',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg"}'::jsonb,
      body:='{"dailyAutoMode": true, "bypassQuotaCheck": false}'::jsonb
    ) as request_id;
  $$
);

-- Schedule daily video view count update at 3:00 AM UTC
-- This will update view counts for ALL videos once per day
SELECT cron.schedule(
  'daily-update-video-views',
  '0 3 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/update-video-views',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg"}'::jsonb,
      body:='{"processAllVideos": true, "batchSize": 50, "bypassQuotaCheck": false}'::jsonb
    ) as request_id;
  $$
);

-- Schedule quota reset at midnight UTC
SELECT cron.schedule(
  'reset-youtube-quota',
  '0 0 * * *',
  $$
  UPDATE api_quota_tracking 
  SET 
    quota_remaining = 10000,
    quota_reset_at = (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date + INTERVAL '1 day',
    last_reset = NOW()
  WHERE api_name = 'youtube';
  $$
);

-- Create a function to check cron job status
CREATE OR REPLACE FUNCTION public.get_cron_jobs()
RETURNS TABLE (
  jobid bigint,
  schedule text,
  command text,
  nodename text,
  nodeport integer,
  database text,
  username text,
  active boolean,
  jobname text
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM cron.job ORDER BY jobname;
$$;

GRANT EXECUTE ON FUNCTION public.get_cron_jobs() TO authenticated;

COMMENT ON FUNCTION public.get_cron_jobs() IS 'Returns all scheduled cron jobs for monitoring purposes';