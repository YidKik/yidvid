
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[YouTube Music] Starting music fetch process');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { artists } = await req.json();
    
    if (!artists || !Array.isArray(artists)) {
      console.error('[YouTube Music] Invalid artists data received:', artists);
      return new Response(
        JSON.stringify({ error: 'Invalid artists data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('[YouTube Music] Processing artists:', artists);

    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) {
      console.error('[YouTube Music] Missing YouTube API key');
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const musicPromises = artists.map(async (artistId: string) => {
      try {
        console.log(`[YouTube Music] Processing artist ID: ${artistId}`);
        
        // First, get channel details
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${artistId}&key=${apiKey}`;
        const channelResponse = await fetch(channelUrl);
        const channelData = await channelResponse.json();

        if (!channelResponse.ok || !channelData.items?.[0]) {
          console.error(`[YouTube Music] Error fetching artist ${artistId}:`, channelData);
          return [];
        }

        const channelTitle = channelData.items[0].snippet.title;
        console.log(`[YouTube Music] Successfully fetched channel data for ${channelTitle}`);

        // Get videos/music from the channel
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${artistId}&type=video&maxResults=50&key=${apiKey}&order=date`;
        const response = await fetch(searchUrl);
        const data = await response.json();

        if (!response.ok || !data.items) {
          console.error(`[YouTube Music] Error fetching music for artist ${artistId}:`, data);
          return [];
        }

        console.log(`[YouTube Music] Found ${data.items.length} tracks for artist ${channelTitle}`);

        // Get video details for duration
        const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`;
        
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        if (!detailsResponse.ok || !detailsData.items) {
          console.error('[YouTube Music] Error fetching video details:', detailsData);
          return [];
        }

        const detailsMap = new Map(
          detailsData.items.map((item: any) => [item.id, item])
        );

        // Store artist info
        const { error: artistError } = await supabaseClient
          .from('music_artists')
          .upsert({
            artist_id: artistId,
            title: channelTitle,
            description: channelData.items[0].snippet.description,
            thumbnail_url: channelData.items[0].snippet.thumbnails.high?.url
          }, {
            onConflict: 'artist_id'
          });

        if (artistError) {
          console.error('[YouTube Music] Error storing artist:', artistError);
          throw artistError;
        }

        console.log(`[YouTube Music] Successfully stored/updated artist: ${channelTitle}`);

        // Transform and store tracks
        const tracks = data.items.map((item: any) => ({
          track_id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
          artist_id: artistId,
          artist_name: channelTitle,
          uploaded_at: item.snippet.publishedAt,
          plays: parseInt(detailsMap.get(item.id.videoId)?.statistics?.viewCount || '0'),
          duration: parseDuration(detailsMap.get(item.id.videoId)?.contentDetails?.duration || 'PT0S'),
          // Generate audio URL using YouTube video ID
          audio_url: `https://www.youtube.com/watch?v=${item.id.videoId}`
        }));

        // Store tracks in batches
        for (const track of tracks) {
          const { error: trackError } = await supabaseClient
            .from('music_tracks')
            .upsert(track, {
              onConflict: 'track_id'
            });

          if (trackError) {
            console.error('[YouTube Music] Error storing track:', trackError, track);
            throw trackError;
          }
          console.log(`[YouTube Music] Successfully stored track: ${track.title}`);
        }

        return tracks;
      } catch (error) {
        console.error(`[YouTube Music] Error processing artist ${artistId}:`, error);
        throw error;
      }
    });

    const results = await Promise.allSettled(musicPromises);
    const successfulTracks = results
      .filter((result): result is PromiseFulfilledResult<any[]> => result.status === 'fulfilled')
      .flatMap(result => result.value);
    
    const failedArtists = results
      .map((result, index) => result.status === 'rejected' ? artists[index] : null)
      .filter(Boolean);

    if (failedArtists.length > 0) {
      console.error('[YouTube Music] Some artists failed to process:', failedArtists);
    }

    console.log(`[YouTube Music] Successfully processed ${successfulTracks.length} tracks`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: successfulTracks.length, 
        tracks: successfulTracks,
        failedArtists 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[YouTube Music] Critical error in edge function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}
