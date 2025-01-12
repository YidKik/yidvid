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
      throw new Error('No channels provided or invalid format');
    }

    console.log('[YouTube Videos] Fetching videos for channels:', channels);

    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) {
      console.error('[YouTube Videos] YouTube API key not configured');
      throw new Error('YouTube API key not configured');
    }

    // Fetch videos for each channel
    const videoPromises = channels.map(async (channelId) => {
      if (!channelId) {
        console.error('[YouTube Videos] Invalid channel ID:', channelId);
        return [];
      }

      console.log(`[YouTube Videos] Fetching videos for channel ${channelId}`);

      try {
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=50&order=date&type=video&key=${apiKey}`;
        console.log('[YouTube Videos] Making request to:', searchUrl.replace(apiKey, '[REDACTED]'));

        const response = await fetch(searchUrl);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[YouTube Videos] Error fetching videos for channel ${channelId}:`, errorText);
          return [];
        }

        const data = await response.json();
        console.log(`[YouTube Videos] Received ${data.items?.length || 0} videos for channel ${channelId}`);
        
        if (!data.items || data.items.length === 0) {
          console.log(`[YouTube Videos] No videos found for channel ${channelId}`);
          return [];
        }

        // Get video statistics in batches
        const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
        const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${apiKey}`;
        console.log('[YouTube Videos] Fetching video statistics...');
        
        const statsResponse = await fetch(statsUrl);
        
        if (!statsResponse.ok) {
          console.error('[YouTube Videos] Error fetching video statistics:', await statsResponse.text());
          return [];
        }

        const statsData = await statsResponse.json();
        const statsMap = new Map(
          statsData.items.map((item: any) => [item.id, item.statistics])
        );

        return data.items.map((item: any) => ({
          video_id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
          channel_id: channelId,
          channel_name: item.snippet.channelTitle,
          uploaded_at: item.snippet.publishedAt,
          views: parseInt(statsMap.get(item.id.videoId)?.viewCount || '0'),
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
        JSON.stringify({ success: false, message: 'No videos found' }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          status: 404
        },
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
      JSON.stringify({ success: true, count: videos.length }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('[YouTube Videos] Error in edge function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});