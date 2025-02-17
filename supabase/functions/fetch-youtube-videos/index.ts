
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
          } 
        }
      );
    }

    console.log(`Processing ${channelsToProcess.length} channels`);
    const processedVideos = [];

    // Process each channel
    for (const channelId of channelsToProcess) {
      try {
        console.log(`Fetching videos for channel: ${channelId}`);
        
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
          allVideos = [...allVideos, ...result.videos];
          nextPageToken = result.nextPageToken;
        } while (nextPageToken);

        if (allVideos.length > 0) {
          const storedVideos = await storeVideosInDatabase(supabase, allVideos);
          processedVideos.push(...storedVideos);
        }

        // Update channel's last_fetch timestamp
        const { error: updateError } = await supabase
          .from('youtube_channels')
          .update({ 
            last_fetch: new Date().toISOString(),
            fetch_error: null
          })
          .eq('channel_id', channelId);

        if (updateError) {
          throw updateError;
        }

      } catch (error) {
        console.error(`Error processing channel ${channelId}:`, error);
        
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
            last_fetch: new Date().toISOString()
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
        processed: processedVideos.length
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
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
