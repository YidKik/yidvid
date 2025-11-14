-- Fix the trigger_youtube_video_fetch function to properly call the edge function with dailyAutoMode
CREATE OR REPLACE FUNCTION public.trigger_youtube_video_fetch()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  response json;
BEGIN
  -- Make HTTP request to the edge function with dailyAutoMode enabled
  SELECT net.http_post(
    url:='https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/fetch-youtube-videos',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg"}'::jsonb,
    body:='{"dailyAutoMode": true, "forceUpdate": false, "quotaConservative": false, "prioritizeRecent": true, "maxChannelsPerRun": 50}'::jsonb
  ) INTO response;

  -- Log the execution
  INSERT INTO public.cron_job_logs (job_name, status, response)
  VALUES ('fetch-youtube-videos', 'completed', response);

  RETURN response;
END;
$$;

-- Create a cron job to run the video fetch daily at 2 AM UTC
SELECT cron.schedule(
  'daily-youtube-video-fetch',
  '0 2 * * *',  -- Run at 2 AM UTC daily
  $$SELECT public.trigger_youtube_video_fetch();$$
);

-- Also create a more frequent check for recent channels (every 6 hours)
SELECT cron.schedule(
  'frequent-youtube-video-fetch',
  '0 */6 * * *',  -- Run every 6 hours
  $$SELECT public.trigger_youtube_video_fetch();$$
);