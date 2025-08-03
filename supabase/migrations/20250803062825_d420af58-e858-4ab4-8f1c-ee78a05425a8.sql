-- Phase 1: Critical Database Security Fixes

-- 1. Fix function search paths for security
ALTER FUNCTION public.is_user_admin(uuid) SET search_path TO 'public';
ALTER FUNCTION public.is_admin_user(uuid) SET search_path TO 'public';
ALTER FUNCTION public.admin_delete_video(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.admin_delete_channel(text, uuid) SET search_path TO 'public';
ALTER FUNCTION public.admin_restore_video(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.admin_restore_channel(text, uuid) SET search_path TO 'public';

-- 2. Fix anonymous access policies - Remove public access where not needed
-- Remove anonymous access from admin notifications
DROP POLICY IF EXISTS "Admin notifications require authentication" ON public.admin_notifications;
CREATE POLICY "Admin notifications require authentication" 
ON public.admin_notifications FOR ALL 
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND is_admin = true
));

-- Remove anonymous access from admin sessions
DROP POLICY IF EXISTS "Users can only access their own admin sessions" ON public.admin_sessions;
CREATE POLICY "Users can only access their own admin sessions" 
ON public.admin_sessions FOR ALL 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Remove anonymous access from quota tracking
DROP POLICY IF EXISTS "Only service role can access quota" ON public.api_quota_tracking;
DROP POLICY IF EXISTS "Allow all access for service role" ON public.api_quota_tracking;
CREATE POLICY "Only authenticated service operations" 
ON public.api_quota_tracking FOR ALL 
USING (current_user = 'service_role');

-- 3. Secure channel category mappings - require authentication
DROP POLICY IF EXISTS "Everyone can read channel category mappings" ON public.channel_category_mappings;
DROP POLICY IF EXISTS "Authenticated users can delete channel category mappings" ON public.channel_category_mappings;
DROP POLICY IF EXISTS "Authenticated users can insert channel category mappings" ON public.channel_category_mappings;
DROP POLICY IF EXISTS "Authenticated users can update channel category mappings" ON public.channel_category_mappings;

CREATE POLICY "Authenticated users can read channel category mappings" 
ON public.channel_category_mappings FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage channel category mappings" 
ON public.channel_category_mappings FOR ALL 
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
));

-- 4. Fix contact requests - remove public access
DROP POLICY IF EXISTS "Users can create contact requests" ON public.contact_requests;
CREATE POLICY "Authenticated users can create contact requests" 
ON public.contact_requests FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Add missing RLS policies for tables that have RLS enabled but no policies
-- Add policy for cron_job_logs (currently blocks all access - this is correct for logs)

-- 6. Secure video comments - ensure authentication
DROP POLICY IF EXISTS "Anyone can read comments" ON public.video_comments;
CREATE POLICY "Authenticated users can read comments" 
ON public.video_comments FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 7. Create rate limiting table for authentication attempts
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP address or user email
  attempt_type text NOT NULL, -- 'login', 'admin_pin', 'signup'
  attempts integer DEFAULT 1,
  first_attempt_at timestamp with time zone DEFAULT now(),
  last_attempt_at timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(identifier, attempt_type)
);

-- Enable RLS on rate limits table
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow system access to rate limits
CREATE POLICY "System access only for rate limits" 
ON public.auth_rate_limits FOR ALL 
USING (current_user = 'service_role');

-- 8. Create security events log table
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- 'failed_login', 'admin_access', 'suspicious_activity'
  user_id uuid REFERENCES auth.users(id),
  ip_address inet,
  user_agent text,
  details jsonb,
  severity text DEFAULT 'info', -- 'info', 'warning', 'critical'
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can read security events
CREATE POLICY "Admins can read security events" 
ON public.security_events FOR SELECT 
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
));

-- System can insert security events
CREATE POLICY "System can insert security events" 
ON public.security_events FOR INSERT 
WITH CHECK (current_user = 'service_role');

-- 9. Add session cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Clean up expired admin sessions
  DELETE FROM admin_sessions WHERE expires_at < now();
  
  -- Clean up old rate limit entries (older than 24 hours)
  DELETE FROM auth_rate_limits 
  WHERE last_attempt_at < now() - interval '24 hours';
  
  -- Clean up old security events (older than 30 days)
  DELETE FROM security_events 
  WHERE created_at < now() - interval '30 days';
END;
$$;