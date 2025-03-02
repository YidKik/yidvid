
-- Update the RLS policy for the youtube_channels table to allow public reads
CREATE POLICY "Enable public read access for youtube_channels" 
ON public.youtube_channels
FOR SELECT 
USING (
  deleted_at IS NULL
);

-- Update the RLS policy for the youtube_videos table to allow public reads
CREATE POLICY "Enable public read access for youtube_videos" 
ON public.youtube_videos
FOR SELECT 
USING (
  deleted_at IS NULL
);

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
