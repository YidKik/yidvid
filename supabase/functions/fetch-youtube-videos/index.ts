
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

    // Process channels in parallel with a smaller batch size
    const batchSize = 2; // Process 2 channels at a time to avoid rate limits
    const results = [];
    
    // First phase: Fetch initial 50 videos for each channel
    for (let i = 0; i < channels.length; i += batchSize) {
      const batch = channels.slice(i, i + batchSize);
      console.log(`[YouTube Videos] Processing batch ${i / batchSize + 1} of ${Math.ceil(channels.length / batchSize)}`);
      
      const batchResults = await Promise.all(
        batch.map(async (channelId) => {
          let allVideos = [];
          let nextPageToken = null;
          
          do {
            const { videos, nextPageToken: newPageToken } = await fetchChannelVideos(channelId, apiKey, nextPageToken);
            allVideos.push(...videos);
            nextPageToken = newPageToken;
            
            if (nextPageToken) {
              // Add a small delay between pagination requests
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } while (nextPageToken);
          
          return allVideos;
        })
      );
      
      results.push(...batchResults.flat());
      
      if (i + batchSize < channels.length) {
        // Add a small delay between batches to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`[YouTube Videos] Fetch complete. Total videos: ${results.length}`);

    // Store videos in database
    await storeVideosInDatabase(supabaseClient, results);

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
