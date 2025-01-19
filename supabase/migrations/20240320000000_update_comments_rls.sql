-- Enable comment management for admins
CREATE POLICY "Enable comment management for admins"
ON public.video_comments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);