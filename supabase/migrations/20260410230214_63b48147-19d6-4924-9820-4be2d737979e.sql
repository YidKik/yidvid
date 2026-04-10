
-- Allow users to update their own analytics sessions (to set session_end)
CREATE POLICY "Users can update own analytics"
ON public.user_analytics
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
