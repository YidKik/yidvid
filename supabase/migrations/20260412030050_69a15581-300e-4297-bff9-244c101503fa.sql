ALTER TABLE public.youtube_videos ADD COLUMN is_short BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_youtube_videos_is_short ON public.youtube_videos (is_short) WHERE deleted_at IS NULL;