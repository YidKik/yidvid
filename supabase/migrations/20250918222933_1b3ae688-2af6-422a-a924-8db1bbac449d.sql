-- Create enum for content analysis status
CREATE TYPE content_analysis_status AS ENUM ('pending', 'approved', 'rejected', 'processing', 'flagged');

-- Create YouTube channels table
CREATE TABLE IF NOT EXISTS public.youtube_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id TEXT NOT NULL UNIQUE,
  channel_name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  subscriber_count INTEGER DEFAULT 0,
  video_count INTEGER DEFAULT 0,
  default_category TEXT,
  last_fetch TIMESTAMP WITH TIME ZONE,
  fetch_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create YouTube videos table
CREATE TABLE IF NOT EXISTS public.youtube_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds
  published_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  channel_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  content_analysis_status content_analysis_status DEFAULT 'pending',
  analysis_details JSONB DEFAULT '{}',
  analysis_score NUMERIC DEFAULT 0.0,
  analysis_timestamp TIMESTAMP WITH TIME ZONE,
  manual_review_required BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_youtube_videos_channel_id ON public.youtube_videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_status ON public.youtube_videos(content_analysis_status);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_published ON public.youtube_videos(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_deleted ON public.youtube_videos(deleted_at);
CREATE INDEX IF NOT EXISTS idx_youtube_channels_deleted ON public.youtube_channels(deleted_at);

-- Enable RLS
ALTER TABLE public.youtube_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for youtube_channels
CREATE POLICY "Public can view active channels" ON public.youtube_channels
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Admins can manage channels" ON public.youtube_channels
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- RLS Policies for youtube_videos  
CREATE POLICY "Public can view approved videos" ON public.youtube_videos
  FOR SELECT USING (
    content_analysis_status = 'approved' AND deleted_at IS NULL
  );

CREATE POLICY "Admins can manage all videos" ON public.youtube_videos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_youtube_channels_updated_at
  BEFORE UPDATE ON public.youtube_channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_youtube_videos_updated_at
  BEFORE UPDATE ON public.youtube_videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO public.youtube_channels (channel_id, channel_name, description, thumbnail_url, subscriber_count) VALUES
  ('UC_sample1', 'Sample Kids Channel', 'Educational content for children', 'https://via.placeholder.com/200x200', 50000),
  ('UC_sample2', 'Family Fun TV', 'Family-friendly entertainment', 'https://via.placeholder.com/200x200', 75000)
ON CONFLICT (channel_id) DO NOTHING;

INSERT INTO public.youtube_videos (
  video_id, title, description, thumbnail_url, duration, published_at, 
  view_count, channel_id, channel_name, content_analysis_status, analysis_score
) VALUES
  ('video_001', 'Fun Learning Songs for Kids', 'Educational songs about numbers and letters', 'https://via.placeholder.com/320x180', 180, NOW() - INTERVAL '2 days', 1500, 'UC_sample1', 'Sample Kids Channel', 'approved', 8.5),
  ('video_002', 'Animal Adventure Story', 'Adventure story featuring friendly animals', 'https://via.placeholder.com/320x180', 240, NOW() - INTERVAL '1 day', 2300, 'UC_sample1', 'Sample Kids Channel', 'approved', 9.2),
  ('video_003', 'Questionable Content Video', 'This video has some issues', 'https://via.placeholder.com/320x180', 300, NOW() - INTERVAL '3 hours', 450, 'UC_sample2', 'Family Fun TV', 'rejected', 3.1),
  ('video_004', 'Pending Review Video', 'This video is waiting for review', 'https://via.placeholder.com/320x180', 200, NOW() - INTERVAL '1 hour', 120, 'UC_sample2', 'Family Fun TV', 'pending', 6.5)
ON CONFLICT (video_id) DO NOTHING;