-- Make fetch-youtube-videos function public so it can be called without authentication
-- This is necessary for the admin video fetching functionality to work properly

-- Update the function configuration to allow public access
-- Note: This is controlled by the supabase/config.toml file, but we need to ensure
-- the RLS policies allow service_role access to required data

-- Ensure service_role can access youtube_channels table
DROP POLICY IF EXISTS "Service role can manage youtube channels" ON public.youtube_channels;
CREATE POLICY "Service role can manage youtube channels" 
ON public.youtube_channels FOR ALL 
USING (auth.role() = 'service_role');

-- Ensure service_role can access youtube_videos table  
DROP POLICY IF EXISTS "Service role can manage youtube videos" ON public.youtube_videos;
CREATE POLICY "Service role can manage youtube videos" 
ON public.youtube_videos FOR ALL 
USING (auth.role() = 'service_role');

-- Ensure service_role can access api_quota_tracking table
DROP POLICY IF EXISTS "Service role can manage api quota" ON public.api_quota_tracking;
CREATE POLICY "Service role can manage api quota" 
ON public.api_quota_tracking FOR ALL 
USING (auth.role() = 'service_role');