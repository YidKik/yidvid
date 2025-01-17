import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[YouTube Videos] Starting video fetch process');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request body
    const { channels } = await req.json();
    
    if (!channels || !Array.isArray(channels)) {
      console.error('[YouTube Videos] Invalid channels data received:', channels);
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid channels data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('[YouTube Videos] Fetching videos for channels:', channels);

    const apiKey = Deno.env.get('YOUTUBE_API_KEY');

    if (!apiKey) {
      console.error('[YouTube Videos] Missing YouTube API key');
      return new Response(
        JSON.stringify({ success: false, message: 'YouTube API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Fetch videos for each channel
    const videoPromises = channels.map(async (channelId) => {
      if (!channelId) {
        console.error('[YouTube Videos] Invalid channel ID:', channelId);
        return [];
      }

      console.log(`[YouTube Videos] Fetching videos for channel ${channelId}`);

      try {
        // First, get channel details including upload playlist ID
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,statistics&id=${channelId}&key=${apiKey}`;
        const channelResponse = await fetch(channelUrl);
        const channelData = await channelResponse.json();

        if (!channelResponse.ok || !channelData.items?.[0]) {
          console.error(`[YouTube Videos] Error fetching channel ${channelId}:`, channelData);
          return [];
        }

        const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

        // Get videos from uploads playlist
        const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`;
        const response = await fetch(playlistUrl);
        const data = await response.json();

        if (!response.ok || !data.items) {
          console.error(`[YouTube Videos] Error fetching videos for channel ${channelId}:`, data);
          return [];
        }

        console.log(`[YouTube Videos] Received ${data.items.length} videos for channel ${channelId}`);

        // Get video statistics in batches
        const videoIds = data.items.map((item: any) => item.snippet.resourceId.videoId).join(',');
        const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${apiKey}`;
        
        const statsResponse = await fetch(statsUrl);
        const statsData = await statsResponse.json();

        if (!statsResponse.ok || !statsData.items) {
          console.error('[YouTube Videos] Error fetching video statistics:', statsData);
          return [];
        }

        const statsMap = new Map(
          statsData.items.map((item: any) => [item.id, item.statistics])
        );

        return data.items.map((item: any) => ({
          video_id: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
          channel_id: channelId,
          channel_name: item.snippet.channelTitle,
          uploaded_at: item.snippet.publishedAt,
          views: parseInt(statsMap.get(item.snippet.resourceId.videoId)?.viewCount || '0'),
          likes: parseInt(statsMap.get(item.snippet.resourceId.videoId)?.likeCount || '0'),
          comments: parseInt(statsMap.get(item.snippet.resourceId.videoId)?.commentCount || '0')
        }));
      } catch (error) {
        console.error(`[YouTube Videos] Error processing channel ${channelId}:`, error);
        return [];
      }
    });

    const videos = (await Promise.all(videoPromises)).flat();
    console.log(`[YouTube Videos] Total videos fetched: ${videos.length}`);

    if (videos.length === 0) {
      console.warn('[YouTube Videos] No videos were fetched for any channels');
      return new Response(
        JSON.stringify({ success: true, videos: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
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
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('[YouTube Videos] Error in edge function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message, videos: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});