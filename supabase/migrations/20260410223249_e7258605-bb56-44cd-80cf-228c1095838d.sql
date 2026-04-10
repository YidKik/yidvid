-- Drop music-related tables (order matters due to foreign keys)
DROP TABLE IF EXISTS public.music_playlist_tracks CASCADE;
DROP TABLE IF EXISTS public.music_playlists CASCADE;
DROP TABLE IF EXISTS public.music_tracks CASCADE;
DROP TABLE IF EXISTS public.music_albums CASCADE;
DROP TABLE IF EXISTS public.music_artists CASCADE;

-- Drop music-related function
DROP FUNCTION IF EXISTS public.fetch_music_for_new_artist() CASCADE;

-- Drop global_notifications table
DROP TABLE IF EXISTS public.global_notifications CASCADE;