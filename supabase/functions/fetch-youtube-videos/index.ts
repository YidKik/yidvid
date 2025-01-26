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
    console.log('[YouTube Videos] Starting video fetch process');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { channels } = await req.json();
    
    if (!channels || !Array.isArray(channels)) {
      console.error('[YouTube Videos] Invalid channels data received:', channels);
      return new Response(
        JSON.stringify({ error: 'Invalid channels data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('[YouTube Videos] Fetching videos for channels:', channels);

    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) {
      console.error('[YouTube Videos] Missing YouTube API key');
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const fetchAllVideosForChannel = async (channelId: string) => {
      let allVideos = [];
      let nextPageToken = '';
      let totalVideosFetched = 0;
      const maxVideosToFetch = 500; // Set a reasonable limit to avoid excessive API calls
      
      try {
        // First, get channel details including upload playlist ID
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
        const channelResponse = await fetch(channelUrl);
        const channelData = await channelResponse.json();

        if (!channelResponse.ok || !channelData.items?.[0]) {
          console.error(`[YouTube Videos] Error fetching channel ${channelId}:`, channelData);
          return [];
        }

        const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
        console.log(`[YouTube Videos] Found uploads playlist: ${uploadsPlaylistId}`);

        // Keep fetching videos until there are no more pages
        do {
          if (totalVideosFetched >= maxVideosToFetch) {
            console.log(`[YouTube Videos] Reached maximum video limit (${maxVideosToFetch}) for channel ${channelId}`);
            break;
          }

          const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
          const response = await fetch(playlistUrl);
          const data = await response.json();

          if (!response.ok || !data.items) {
            console.error(`[YouTube Videos] Error fetching videos for channel ${channelId}:`, data);
            break;
          }

          // Get video IDs for this page
          const videoIds = data.items.map((item: any) => item.snippet.resourceId.videoId);
          
          // Fetch statistics for these videos
          const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds.join(',')}&key=${apiKey}`;
          const statsResponse = await fetch(statsUrl);
          const statsData = await statsResponse.json();

          if (!statsResponse.ok || !statsData.items) {
            console.error('[YouTube Videos] Error fetching video statistics:', statsData);
            break;
          }

          const statsMap = new Map(
            statsData.items.map((item: any) => [item.id, item.statistics])
          );

          // Process videos from this page
          const processedVideos = data.items.map((item: any) => ({
            video_id: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
            channel_id: channelId,
            channel_name: item.snippet.channelTitle,
            uploaded_at: item.snippet.publishedAt,
            views: parseInt(statsMap.get(item.snippet.resourceId.videoId)?.viewCount || '0'),
          }));

          allVideos = [...allVideos, ...processedVideos];
          nextPageToken = data.nextPageToken;
          totalVideosFetched += processedVideos.length;
          
          console.log(`[YouTube Videos] Fetched ${processedVideos.length} videos. Total so far: ${allVideos.length}`);
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } while (nextPageToken && totalVideosFetched < maxVideosToFetch);

        return allVideos;
      } catch (error) {
        console.error(`[YouTube Videos] Error processing channel ${channelId}:`, error);
        return [];
      }
    };

    const videoPromises = channels.map(fetchAllVideosForChannel);
    const videos = (await Promise.all(videoPromises)).flat();
    console.log(`[YouTube Videos] Total videos fetched: ${videos.length}`);

    if (videos.length === 0) {
      console.warn('[YouTube Videos] No videos were fetched for any channels');
      return new Response(
        JSON.stringify({ success: true, videos: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store videos in the database
    console.log('[YouTube Videos] Starting to store videos in database');
    for (const video of videos) {
      const { error: upsertError } = await supabaseClient
        .from('youtube_videos')
        .upsert(video, { 
          onConflict: 'video_id',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error('[YouTube Videos] Error upserting video:', upsertError);
      }
    }
    console.log('[YouTube Videos] Finished storing videos in database');

    return new Response(
      JSON.stringify({ success: true, count: videos.length, videos }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[YouTube Videos] Error in edge function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});