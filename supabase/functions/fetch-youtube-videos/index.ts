
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './utils.ts';
import { getChannelsFromDatabase, storeVideosInDatabase } from './db-operations.ts';
import { fetchChannelVideos } from './youtube-api.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    if (!youtubeApiKey) {
      throw new Error('Missing YouTube API configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current time in UTC
    const now = new Date();

    // Check and reset quota if needed
    const { data: quotaData, error: quotaError } = await supabase
      .from('api_quota_tracking')
      .select('quota_remaining, quota_reset_at')
      .eq('api_name', 'youtube')
      .single();

    if (quotaError) {
      console.error('Error checking quota:', quotaError);
      throw new Error('Failed to check API quota');
    }

    // Reset quota if we've passed the reset time
    if (now >= new Date(quotaData.quota_reset_at)) {
      const { error: resetError } = await supabase
        .from('api_quota_tracking')
        .update({ 
          quota_remaining: 10000,
          quota_reset_at: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          updated_at: now.toISOString()
        })
        .eq('api_name', 'youtube');

      if (resetError) {
        console.error('Error resetting quota:', resetError);
        throw new Error('Failed to reset API quota');
      }
    } else if (quotaData.quota_remaining <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'YouTube API quota exceeded',
          message: `Daily quota exceeded. Service will resume at ${new Date(quotaData.quota_reset_at).toLocaleString()}`,
          quota_reset_at: quotaData.quota_reset_at
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429
        }
      );
    }

    // Parse request body if present
    let channelsToProcess = [];
    if (req.body) {
      const body = await req.json().catch(() => ({}));
      channelsToProcess = body.channels || [];
    }

    // If no specific channels provided, get all active channels
    if (channelsToProcess.length === 0) {
      channelsToProcess = await getChannelsFromDatabase(supabase);
    }

    if (channelsToProcess.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No channels to process' }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
          status: 200
        }
      );
    }

    console.log(`Processing ${channelsToProcess.length} channels`);
    const processedVideos = [];
    const errors = [];

    // Process each channel
    for (const channelId of channelsToProcess) {
      try {
        console.log(`Fetching videos for channel: ${channelId}`);
        
        // Check current quota before processing channel
        const { data: currentQuota, error: quotaCheckError } = await supabase
          .from('api_quota_tracking')
          .select('quota_remaining')
          .eq('api_name', 'youtube')
          .single();

        if (quotaCheckError || currentQuota.quota_remaining <= 0) {
          console.log('YouTube API quota exceeded, stopping further requests');
          return new Response(
            JSON.stringify({
              success: false,
              error: 'YouTube API quota exceeded',
              message: 'Daily quota exceeded. Please try again later.',
              processed: processedVideos.length,
              errors
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 429
            }
          );
        }

        // Log the start of update
        const { error: logError } = await supabase
          .from('youtube_update_logs')
          .insert({
            channel_id: channelId,
            videos_count: 0
          });

        if (logError) {
          console.error('Error logging update:', logError);
        }

        let nextPageToken: string | null = null;
        let allVideos = [];

        do {
          const result = await fetchChannelVideos(channelId, youtubeApiKey, nextPageToken);
          
          // Update quota after successful API call
          if (!result.quotaExceeded) {
            await supabase
              .from('api_quota_tracking')
              .update({ 
                quota_remaining: currentQuota.quota_remaining - 1,
                updated_at: now.toISOString()
              })
              .eq('api_name', 'youtube');
            
            allVideos = [...allVideos, ...result.videos];
            nextPageToken = result.nextPageToken;
          } else {
            await supabase
              .from('api_quota_tracking')
              .update({ 
                quota_remaining: 0,
                updated_at: now.toISOString()
              })
              .eq('api_name', 'youtube');
              
            break;
          }
        } while (nextPageToken);

        if (allVideos.length > 0) {
          const storedVideos = await storeVideosInDatabase(supabase, allVideos);
          processedVideos.push(...storedVideos);
        }

        // Update channel's last_fetch timestamp
        const { error: updateError } = await supabase
          .from('youtube_channels')
          .update({ 
            last_fetch: now.toISOString(),
            fetch_error: null
          })
          .eq('channel_id', channelId);

        if (updateError) {
          throw updateError;
        }

      } catch (error) {
        console.error(`Error processing channel ${channelId}:`, error);
        errors.push({ channelId, error: error.message });
        
        // Log error in youtube_update_logs
        await supabase
          .from('youtube_update_logs')
          .insert({
            channel_id: channelId,
            error: error.message
          });

        // Update channel with error
        await supabase
          .from('youtube_channels')
          .update({ 
            fetch_error: error.message,
            last_fetch: now.toISOString()
          })
          .eq('channel_id', channelId);
      }

      // Add delay between processing channels
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Channel processing complete',
        processed: processedVideos.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'An error occurred while processing the request'
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

