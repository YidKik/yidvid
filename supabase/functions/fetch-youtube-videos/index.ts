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

    // If no channels provided, fetch all channels from the database
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

    const fetchAllVideosForChannel = async (channelId: string) => {
      let allVideos = [];
      let nextPageToken = '';
      let totalVideosFetched = 0;
      const maxVideosToFetch = 1000;
      
      try {
        // First, get channel details including upload playlist ID
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&id=${channelId}&key=${apiKey}`;
        const channelResponse = await fetch(channelUrl);
        const channelData = await channelResponse.json();

        if (!channelResponse.ok || !channelData.items?.[0]) {
          console.error(`[YouTube Videos] Error fetching channel ${channelId}:`, channelData);
          return [];
        }

        const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
        const channelTitle = channelData.items[0].snippet.title;
        console.log(`[YouTube Videos] Found uploads playlist: ${uploadsPlaylistId} for channel: ${channelTitle}`);

        // Keep fetching videos until there are no more pages
        do {
          if (totalVideosFetched >= maxVideosToFetch) {
            console.log(`[YouTube Videos] Reached maximum video limit (${maxVideosToFetch}) for channel ${channelId}`);
            break;
          }

          console.log(`[YouTube Videos] Fetching page of videos. Current total: ${totalVideosFetched}`);
          
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
          const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(',')}&key=${apiKey}`;
          const statsResponse = await fetch(statsUrl);
          const statsData = await statsResponse.json();

          if (!statsResponse.ok || !statsData.items) {
            console.error('[YouTube Videos] Error fetching video statistics:', statsData);
            break;
          }

          const statsMap = new Map(
            statsData.items.map((item: any) => [item.id, {
              statistics: item.statistics,
              description: item.snippet.description
            }])
          );

          // Process videos from this page
          const processedVideos = data.items.map((item: any) => ({
            video_id: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
            channel_id: channelId,
            channel_name: item.snippet.channelTitle,
            uploaded_at: item.snippet.publishedAt,
            views: parseInt(statsMap.get(item.snippet.resourceId.videoId)?.statistics.viewCount || '0'),
            description: statsMap.get(item.snippet.resourceId.videoId)?.description || null,
          }));

          allVideos = [...allVideos, ...processedVideos];
          nextPageToken = data.nextPageToken;
          totalVideosFetched += processedVideos.length;
          
          console.log(`[YouTube Videos] Fetched ${processedVideos.length} videos. Total so far: ${allVideos.length}`);
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 250));
          
        } while (nextPageToken && totalVideosFetched < maxVideosToFetch);

        console.log(`[YouTube Videos] Completed fetching videos for channel ${channelId}. Total videos: ${allVideos.length}`);
        return allVideos;
      } catch (error) {
        console.error(`[YouTube Videos] Error processing channel ${channelId}:`, error);
        return [];
      }
    };

    // Process channels in parallel with a concurrency limit
    const concurrencyLimit = 3;
    const processChannels = async (channelIds: string[]) => {
      const results = [];
      for (let i = 0; i < channelIds.length; i += concurrencyLimit) {
        const batch = channelIds.slice(i, i + concurrencyLimit);
        const batchResults = await Promise.all(batch.map(fetchAllVideosForChannel));
        results.push(...batchResults.flat());
      }
      return results;
    };

    const videos = await processChannels(channels);
    console.log(`[YouTube Videos] Total videos fetched across all channels: ${videos.length}`);

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
