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

    let channels;
    if (req.body) {
      const body = await req.json();
      channels = body.channels;
    }

    if (!channels || !Array.isArray(channels) || channels.length === 0) {
      console.log('[YouTube Videos] No channels provided, fetching all channels');
      const { data: channelsData, error: channelsError } = await supabaseClient
        .from('youtube_channels')
        .select('channel_id');

      if (channelsError) {
        console.error('[YouTube Videos] Error fetching channels:', channelsError);
        throw channelsError;
      }

      channels = channelsData.map(channel => channel.channel_id);
    }

    console.log('[YouTube Videos] Fetching videos for channels:', channels);

    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) {
      console.error('[YouTube Videos] Missing YouTube API key');
      throw new Error('YouTube API key not configured');
    }

    const fetchChannelVideos = async (channelId: string) => {
      try {
        // Get channel details
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&id=${channelId}&key=${apiKey}`;
        const channelResponse = await fetch(channelUrl);
        const channelData = await channelResponse.json();

        if (!channelResponse.ok || !channelData.items?.[0]) {
          console.error(`[YouTube Videos] Error fetching channel ${channelId}:`, channelData);
          return [];
        }

        const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
        const channelTitle = channelData.items[0].snippet.title;

        // Fetch only the most recent videos (last 50)
        const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`;
        const response = await fetch(playlistUrl);
        const data = await response.json();

        if (!response.ok || !data.items) {
          console.error(`[YouTube Videos] Error fetching videos for channel ${channelId}:`, data);
          return [];
        }

        // Get video IDs and fetch statistics in a single batch
        const videoIds = data.items.map((item: any) => item.snippet.resourceId.videoId);
        const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(',')}&key=${apiKey}`;
        const statsResponse = await fetch(statsUrl);
        const statsData = await statsResponse.json();

        if (!statsResponse.ok || !statsData.items) {
          console.error('[YouTube Videos] Error fetching video statistics:', statsData);
          return [];
        }

        // Create a map for quick lookup of statistics
        const statsMap = new Map(
          statsData.items.map((item: any) => [item.id, {
            statistics: item.statistics,
            description: item.snippet.description
          }])
        );

        // Process videos with their statistics
        return data.items.map((item: any) => ({
          video_id: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
          channel_id: channelId,
          channel_name: item.snippet.channelTitle,
          uploaded_at: item.snippet.publishedAt,
          views: parseInt(statsMap.get(item.snippet.resourceId.videoId)?.statistics.viewCount || '0'),
          description: statsMap.get(item.snippet.resourceId.videoId)?.description || null,
        }));
      } catch (error) {
        console.error(`[YouTube Videos] Error processing channel ${channelId}:`, error);
        return [];
      }
    };

    // Process channels in parallel with a smaller batch size
    const batchSize = 2; // Process 2 channels at a time to avoid rate limits
    const results = [];
    
    for (let i = 0; i < channels.length; i += batchSize) {
      const batch = channels.slice(i, i + batchSize);
      console.log(`[YouTube Videos] Processing batch ${i / batchSize + 1} of ${Math.ceil(channels.length / batchSize)}`);
      
      const batchResults = await Promise.all(batch.map(fetchChannelVideos));
      results.push(...batchResults.flat());
      
      if (i + batchSize < channels.length) {
        // Add a small delay between batches to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`[YouTube Videos] Total videos fetched: ${results.length}`);

    // Store videos in batches
    const batchInsertSize = 100;
    for (let i = 0; i < results.length; i += batchInsertSize) {
      const batch = results.slice(i, i + batchInsertSize);
      const { error: upsertError } = await supabaseClient
        .from('youtube_videos')
        .upsert(batch, { 
          onConflict: 'video_id',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error(`[YouTube Videos] Error upserting batch ${Math.floor(i / batchInsertSize) + 1}:`, upsertError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: results.length }),
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