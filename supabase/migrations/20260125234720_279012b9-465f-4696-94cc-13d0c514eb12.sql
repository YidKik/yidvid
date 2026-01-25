-- Create video_playlists table for user-created playlists
CREATE TABLE public.video_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create video_playlist_items table for playlist items
CREATE TABLE public.video_playlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.video_playlists(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.youtube_videos(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, video_id)
);

-- Enable RLS
ALTER TABLE public.video_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_playlist_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for video_playlists
CREATE POLICY "Users can view their own playlists"
  ON public.video_playlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public playlists"
  ON public.video_playlists FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create their own playlists"
  ON public.video_playlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists"
  ON public.video_playlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
  ON public.video_playlists FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for video_playlist_items
CREATE POLICY "Users can view items in their playlists"
  ON public.video_playlist_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.video_playlists 
    WHERE id = playlist_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can view items in public playlists"
  ON public.video_playlist_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.video_playlists 
    WHERE id = playlist_id AND is_public = true
  ));

CREATE POLICY "Users can add items to their playlists"
  ON public.video_playlist_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.video_playlists 
    WHERE id = playlist_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update items in their playlists"
  ON public.video_playlist_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.video_playlists 
    WHERE id = playlist_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete items from their playlists"
  ON public.video_playlist_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.video_playlists 
    WHERE id = playlist_id AND user_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX idx_video_playlists_user_id ON public.video_playlists(user_id);
CREATE INDEX idx_video_playlist_items_playlist_id ON public.video_playlist_items(playlist_id);
CREATE INDEX idx_video_playlist_items_video_id ON public.video_playlist_items(video_id);

-- Trigger for updated_at
CREATE TRIGGER update_video_playlists_updated_at
  BEFORE UPDATE ON public.video_playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();