import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, validateEnvironment, createSupabaseClient } from './utils.ts';
import { fetchChannelVideos } from './youtube-api.ts';
import { getChannelsFromDatabase, storeVideosInDatabase } from './db-operations.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[YouTube Videos] Starting video fetch process');
    
    const supabaseClient = createSupabaseClient();
    const apiKey = validateEnvironment();

    let channels;
    if (req.body) {
      const body = await req.json();
      channels = body.channels;
    }

    if (!channels || !Array.isArray(channels) || channels.length === 0) {
      console.log('[YouTube Videos] No channels provided, fetching all channels');
      channels = await getChannelsFromDatabase(supabaseClient);
    }

    console.log('[YouTube Videos] Fetching videos for channels:', channels);

    // Process channels sequentially to better handle rate limits
    const results = [];
    
    for (const channelId of channels) {
      console.log(`[YouTube Videos] Processing channel: ${channelId}`);
      
      let allVideos = [];
      let nextPageToken = null;
      let retryCount = 0;
      const maxRetries = 3;
      
      // Keep fetching until we have all videos
      do {
        try {
          console.log(`[YouTube Videos] Fetching page ${allVideos.length / 50 + 1} for channel ${channelId}`);
          const { videos, nextPageToken: newPageToken } = await fetchChannelVideos(channelId, apiKey, nextPageToken);
          
          if (videos.length > 0) {
            allVideos.push(...videos);
            console.log(`[YouTube Videos] Retrieved ${videos.length} videos, total for channel now: ${allVideos.length}`);
          }
          
          nextPageToken = newPageToken;
          retryCount = 0; // Reset retry count on successful fetch
          
          // Add a delay between pagination requests to avoid rate limiting
          if (nextPageToken) {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        } catch (error) {
          console.error(`[YouTube Videos] Error fetching videos for channel ${channelId}:`, error);
          retryCount++;
          
          if (retryCount >= maxRetries) {
            console.error(`[YouTube Videos] Max retries reached for channel ${channelId}`);
            // Update channel with fetch error
            await supabaseClient
              .from('youtube_channels')
              .update({ 
                fetch_error: error.message,
                last_fetch: new Date().toISOString()
              })
              .eq('channel_id', channelId);
            break;
          }
          
          // Add exponential backoff delay
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        }
      } while (nextPageToken && retryCount < maxRetries);
      
      if (allVideos.length > 0) {
        results.push(...allVideos);
        console.log(`[YouTube Videos] Finished channel ${channelId}. Total videos: ${allVideos.length}`);
        
        // Update channel last fetch time and clear any previous errors
        await supabaseClient
          .from('youtube_channels')
          .update({ 
            fetch_error: null,
            last_fetch: new Date().toISOString()
          })
          .eq('channel_id', channelId);
        
        // Store videos in batches as we go
        await storeVideosInDatabase(supabaseClient, allVideos);
      }
      
      // Add a delay between channels to avoid rate limiting
      if (channels.indexOf(channelId) < channels.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`[YouTube Videos] Fetch complete. Total videos across all channels: ${results.length}`);

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
