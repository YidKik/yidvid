
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, validateEnvironment, createSupabaseClient, handleError } from './utils.ts';
import { fetchChannelVideos } from './youtube-api.ts';
import { getChannelsFromDatabase, storeVideosInDatabase } from './db-operations.ts';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400', // 24 hours
      }
    });
  }

  try {
    console.log('[YouTube Videos] Starting video fetch process');
    
    // Initialize clients and validate environment
    const supabaseClient = createSupabaseClient();
    const apiKey = validateEnvironment();

    // Parse request body for specific channels
    let channels;
    if (req.body) {
      try {
        const body = await req.json();
        channels = body.channels;
      } catch (error) {
        console.error('[YouTube Videos] Error parsing request body:', error);
      }
    }

    // If no specific channels provided, fetch all channels
    if (!channels || !Array.isArray(channels) || channels.length === 0) {
      console.log('[YouTube Videos] No channels provided, fetching all channels');
      channels = await getChannelsFromDatabase(supabaseClient);
    }

    if (!channels || channels.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No channels to process',
          count: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[YouTube Videos] Fetching videos for channels:', channels);

    // Process channels sequentially to better handle rate limits
    const results = [];
    
    for (const channelId of channels) {
      console.log(`[YouTube Videos] Processing channel: ${channelId}`);
      
      try {
        let allVideos = [];
        let nextPageToken = null;
        let retryCount = 0;
        const maxRetries = 3;
        
        // Keep fetching until we have all videos or hit quota
        do {
          try {
            const { videos, nextPageToken: newPageToken } = await fetchChannelVideos(channelId, apiKey, nextPageToken);
            
            if (videos.length > 0) {
              allVideos.push(...videos);
              console.log(`[YouTube Videos] Retrieved ${videos.length} videos, total for channel now: ${allVideos.length}`);
            }
            
            nextPageToken = newPageToken;
            retryCount = 0; // Reset retry count on successful fetch
            
            // Add a delay between pagination requests
            if (nextPageToken) {
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          } catch (error) {
            console.error(`[YouTube Videos] Error fetching videos for channel ${channelId}:`, error);
            
            if (error.message?.includes('quotaExceeded')) {
              console.log('[YouTube Videos] API quota exceeded, stopping fetch');
              break;
            }
            
            retryCount++;
            
            if (retryCount >= maxRetries) {
              console.error(`[YouTube Videos] Max retries reached for channel ${channelId}`);
              break;
            }
            
            // Add exponential backoff delay
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
          }
        } while (nextPageToken && retryCount < maxRetries);
        
        if (allVideos.length > 0) {
          results.push(...allVideos);
          console.log(`[YouTube Videos] Finished channel ${channelId}. Total videos: ${allVideos.length}`);
          
          // Store videos and update channel status
          await storeVideosInDatabase(supabaseClient, allVideos);
          await supabaseClient
            .from("youtube_channels")
            .update({ 
              fetch_error: null,
              last_fetch: new Date().toISOString()
            })
            .eq("channel_id", channelId);
        }
      } catch (error) {
        console.error(`[YouTube Videos] Error processing channel ${channelId}:`, error);
        
        // Update channel with fetch error
        await supabaseClient
          .from('youtube_channels')
          .update({ 
            fetch_error: error.message,
            last_fetch: new Date().toISOString()
          })
          .eq('channel_id', channelId);
      }
      
      // Add a delay between channels
      if (channels.indexOf(channelId) < channels.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`[YouTube Videos] Fetch complete. Total videos across all channels: ${results.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: results.length,
        message: results.length > 0 ? 'Videos fetched successfully' : 'No new videos to fetch'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    return handleError(error);
  }
});
