-- Enable the pg_cron and pg_net extensions if they're not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the function to run every 15 minutes
SELECT cron.schedule(
  'fetch-youtube-videos',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url:='${Deno.env.get('SUPABASE_URL')}/functions/v1/fetch-youtube-videos',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);