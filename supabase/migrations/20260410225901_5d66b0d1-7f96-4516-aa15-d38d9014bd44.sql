
-- Allow admins to read any user's video history
CREATE POLICY "Admins can view all video history"
ON public.video_history
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read any user's analytics sessions
CREATE POLICY "Admins can view all user analytics"
ON public.user_analytics
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
