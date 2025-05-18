
-- Create function to update video view counts
CREATE OR REPLACE FUNCTION public.update_youtube_quota_usage(used_units integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update the quota tracking table
  UPDATE api_quota_tracking
  SET quota_remaining = quota_remaining - used_units,
      updated_at = now()
  WHERE api_name = 'youtube';
END;
$$;

-- Create function to trigger view count updates
CREATE OR REPLACE FUNCTION public.trigger_video_views_update()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  response json;
BEGIN
  -- Make HTTP request to the edge function
  SELECT net.http_post(
    url:='https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/update-video-views',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg"}'::jsonb,
    body:='{"batchSize": 50, "maxVideos": 300}'::jsonb
  ) INTO response;

  -- Log the execution
  INSERT INTO public.cron_job_logs (job_name, status, response)
  VALUES ('update-video-views', 'completed', response);

  RETURN response;
END;
$$;

-- Add a schedule to update views twice daily
-- Update the existing scheduled jobs
SELECT cron.schedule(
  'update-video-views',
  '0 6,18 * * *',  -- At 6 AM and 6 PM every day
  $$
  -- Call the view update function
  SELECT public.trigger_video_views_update();
  $$
);

-- Add cron job to check for videos that need view updates more frequently
-- This job runs every 8 hours to update view counts for recent videos
SELECT cron.schedule(
  'update-recent-video-views',
  '0 */8 * * *',  -- Every 8 hours
  $$
  SELECT net.http_post(
    url:='https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/update-video-views',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg'
    ),
    body:=jsonb_build_object(
      'batchSize', 25,
      'maxVideos', 100
    )
  );
  $$
);
