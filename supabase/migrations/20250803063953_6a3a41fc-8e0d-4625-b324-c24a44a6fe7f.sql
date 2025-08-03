-- Fix remaining critical security issues from linter

-- 1. Fix function search path issues for remaining functions
ALTER FUNCTION public.cleanup_expired_admin_sessions() SET search_path TO 'public';

-- 2. Fix anonymous access policies - Keep only what's needed for public viewing

-- Remove anonymous access from internal/admin tables
DROP POLICY IF EXISTS "System access only for rate limits" ON public.auth_rate_limits;
CREATE POLICY "Service role only for rate limits" 
ON public.auth_rate_limits FOR ALL 
USING (auth.role() = 'service_role');

-- Fix admin notifications - only authenticated admins
DROP POLICY IF EXISTS "Admin notifications require authentication" ON public.admin_notifications;
CREATE POLICY "Only admins can access notifications" 
ON public.admin_notifications FOR ALL 
USING (auth.uid() IS NOT NULL AND (
  SELECT is_admin FROM profiles WHERE id = auth.uid()
) = true);

-- Fix admin sessions - only session owners
DROP POLICY IF EXISTS "Users can only access their own admin sessions" ON public.admin_sessions;
CREATE POLICY "Session owners only" 
ON public.admin_sessions FOR ALL 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Fix contact requests - authenticated users only
DROP POLICY IF EXISTS "Users can view their own contact requests" ON public.contact_requests;
DROP POLICY IF EXISTS "Authenticated users can create contact requests" ON public.contact_requests;

CREATE POLICY "Authenticated users can create contact requests" 
ON public.contact_requests FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own contact requests" 
ON public.contact_requests FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Admins can view all contact requests" 
ON public.contact_requests FOR SELECT 
USING (auth.uid() IS NOT NULL AND (
  SELECT is_admin FROM profiles WHERE id = auth.uid()
) = true);

-- Fix channel subscriptions - remove anonymous access
DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.channel_subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.channel_subscriptions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.channel_subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscriptions" ON public.channel_subscriptions;
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON public.channel_subscriptions;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.channel_subscriptions;

CREATE POLICY "Users manage own subscriptions only" 
ON public.channel_subscriptions FOR ALL 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Fix security events - admins only
DROP POLICY IF EXISTS "Admins can read security events" ON public.security_events;
DROP POLICY IF EXISTS "System can insert security events" ON public.security_events;

CREATE POLICY "Only admins can read security events" 
ON public.security_events FOR SELECT 
USING (auth.uid() IS NOT NULL AND (
  SELECT is_admin FROM profiles WHERE id = auth.uid()
) = true);

CREATE POLICY "Service role can insert security events" 
ON public.security_events FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Fix hidden channels - users only
DROP POLICY IF EXISTS "Users can manage their hidden channels" ON public.hidden_channels;
CREATE POLICY "Users manage own hidden channels" 
ON public.hidden_channels FOR ALL 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Fix user analytics - remove anonymous access
DROP POLICY IF EXISTS "Users can view own analytics, admins can view all" ON public.user_analytics;
DROP POLICY IF EXISTS "Users can insert their own analytics" ON public.user_analytics;

CREATE POLICY "Users can insert own analytics" 
ON public.user_analytics FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can view own analytics" 
ON public.user_analytics FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics" 
ON public.user_analytics FOR SELECT 
USING (auth.uid() IS NOT NULL AND (
  SELECT is_admin FROM profiles WHERE id = auth.uid()
) = true);

-- Fix user preferences - users only
DROP POLICY IF EXISTS "Users manage own preferences" ON public.user_preferences;
CREATE POLICY "Users manage own preferences only" 
ON public.user_preferences FOR ALL 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Fix parental locks - users only  
DROP POLICY IF EXISTS "Users can manage their own locks" ON public.parental_locks;
CREATE POLICY "Users manage own locks only" 
ON public.parental_locks FOR ALL 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Fix voice assistant interactions - users only
DROP POLICY IF EXISTS "Users manage own voice interactions" ON public.voice_assistant_interactions;
CREATE POLICY "Users manage own voice interactions only" 
ON public.voice_assistant_interactions FOR ALL 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);