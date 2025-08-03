-- Critical Security Fixes - Phase 1: Database Security

-- Fix anonymous access policies by ensuring proper authentication checks
-- Remove overly permissive policies and replace with secure ones

-- 1. Fix admin_notifications - only admins should access
DROP POLICY IF EXISTS "Only admins can access notifications" ON public.admin_notifications;
CREATE POLICY "Only authenticated admins can access notifications" 
ON public.admin_notifications 
FOR ALL 
USING (auth.uid() IS NOT NULL AND public.is_user_admin(auth.uid()));

-- 2. Fix admin_sessions - only session owners should access
DROP POLICY IF EXISTS "Session owners only" ON public.admin_sessions;
CREATE POLICY "Authenticated session owners only" 
ON public.admin_sessions 
FOR ALL 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 3. Fix auth_rate_limits - service role only (no anonymous access)
DROP POLICY IF EXISTS "Service role only for rate limits" ON public.auth_rate_limits;
CREATE POLICY "Service role only for rate limits" 
ON public.auth_rate_limits 
FOR ALL 
USING (auth.role() = 'service_role'::text);

-- 4. Fix channel_category_mappings - restrict anonymous access
DROP POLICY IF EXISTS "Authenticated users can read channel category mappings" ON public.channel_category_mappings;
CREATE POLICY "Authenticated users can read channel category mappings" 
ON public.channel_category_mappings 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 5. Fix contact_requests - no anonymous access to admin functions
DROP POLICY IF EXISTS "Admins can view all contact requests" ON public.contact_requests;
CREATE POLICY "Authenticated admins can view all contact requests" 
ON public.contact_requests 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND public.is_user_admin(auth.uid()));

-- 6. Fix channel_subscriptions - no anonymous access
DROP POLICY IF EXISTS "Admins have full access to channel subscriptions" ON public.channel_subscriptions;
CREATE POLICY "Authenticated admins have full access to channel subscriptions" 
ON public.channel_subscriptions 
FOR ALL 
USING (auth.uid() IS NOT NULL AND public.is_user_admin(auth.uid()));

-- 7. Fix hidden_channels - ensure proper user authentication
DROP POLICY IF EXISTS "Users manage own hidden channels" ON public.hidden_channels;
CREATE POLICY "Authenticated users manage own hidden channels" 
ON public.hidden_channels 
FOR ALL 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 8. Fix user_analytics - ensure proper authentication
DROP POLICY IF EXISTS "Users can view own analytics" ON public.user_analytics;
DROP POLICY IF EXISTS "Admins can view all analytics" ON public.user_analytics;
CREATE POLICY "Authenticated users can view own analytics" 
ON public.user_analytics 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);
CREATE POLICY "Authenticated admins can view all analytics" 
ON public.user_analytics 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND public.is_user_admin(auth.uid()));

-- 9. Fix user_preferences - ensure proper authentication
DROP POLICY IF EXISTS "Users manage own preferences only" ON public.user_preferences;
CREATE POLICY "Authenticated users manage own preferences only" 
ON public.user_preferences 
FOR ALL 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 10. Fix parental_locks - ensure proper authentication
DROP POLICY IF EXISTS "Users manage own locks only" ON public.parental_locks;
CREATE POLICY "Authenticated users manage own locks only" 
ON public.parental_locks 
FOR ALL 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 11. Fix voice_assistant_interactions - ensure proper authentication
DROP POLICY IF EXISTS "Users manage own voice interactions only" ON public.voice_assistant_interactions;
CREATE POLICY "Authenticated users manage own voice interactions only" 
ON public.voice_assistant_interactions 
FOR ALL 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 12. Fix security_events - only authenticated admins should read
DROP POLICY IF EXISTS "Only admins can read security events" ON public.security_events;
CREATE POLICY "Only authenticated admins can read security events" 
ON public.security_events 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND public.is_user_admin(auth.uid()));

-- 13. Add missing RLS policies for tables that have RLS enabled but no policies
-- Check if any tables need policies added (the linter will tell us)

-- 14. Fix function security - ensure all security definer functions have proper search_path
CREATE OR REPLACE FUNCTION public.cleanup_expired_admin_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.admin_sessions 
  WHERE expires_at < NOW();
END;
$$;

-- 15. Create secure admin session invalidation function
CREATE OR REPLACE FUNCTION public.invalidate_admin_session(session_token uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow users to invalidate their own sessions
  DELETE FROM public.admin_sessions 
  WHERE admin_token = session_token 
  AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- 16. Create rate limiting function for admin operations
CREATE OR REPLACE FUNCTION public.check_admin_rate_limit(operation_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_ip inet;
  attempt_count integer;
BEGIN
  -- Get user IP (simplified for this implementation)
  user_ip := '0.0.0.0'::inet; -- In real implementation, this would come from headers
  
  -- Check recent attempts (last 15 minutes)
  SELECT COUNT(*) INTO attempt_count
  FROM public.auth_rate_limits
  WHERE identifier = user_ip::text
  AND attempt_type = operation_type
  AND last_attempt_at > now() - interval '15 minutes';
  
  -- Allow up to 5 attempts per 15 minutes
  RETURN attempt_count < 5;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.invalidate_admin_session TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_admin_rate_limit TO authenticated;