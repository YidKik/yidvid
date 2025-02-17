
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../fetch-youtube-videos/utils.ts';
import { fetchChannelVideos } from '../fetch-youtube-videos/youtube-api.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First check quota status
    const { data: quotaData, error: quotaError } = await supabase
      .from('api_quota_tracking')
      .select('quota_remaining, quota_reset_at')
      .eq('api_name', 'youtube')
      .single();

    if (quotaError) {
      throw new Error('Failed to check API quota');
    }

    if (quotaData.quota_remaining <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Daily quota exceeded. Service will resume at ${new Date(quotaData.quota_reset_at).toUTCString()}`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Get all channels that haven't been fetched in the last 7 days or have never been fetched
    const { data: channels, error: channelsError } = await supabase
      .from('youtube_channels')
      .select('*')
      .or('last_fetch.is.null,last_fetch.lt.now()-interval.7 days')
      .is('deleted_at', null)
      .is('fetch_error', null)
      .order('last_fetch', { ascending: true, nullsFirst: true })
      .limit(5); // Process 5 channels at a time to manage quota

    if (channelsError) {
      throw new Error('Failed to fetch channels');
    }

    console.log(`Processing ${channels?.length || 0} channels`);
    const results = [];

    for (const channel of channels || []) {
      try {
        console.log(`Fetching videos for channel: ${channel.title} (${channel.channel_id})`);
        
        // Check quota before each channel
        const { data: currentQuota } = await supabase
          .from('api_quota_tracking')
          .select('quota_remaining')
          .eq('api_name', 'youtube')
          .single();

        if (!currentQuota || currentQuota.quota_remaining <= 0) {
          console.log('Quota exceeded during processing');
          break;
        }

        let nextPageToken: string | null = null;
        let allVideos = [];

        do {
          const result = await fetchChannelVideos(channel.channel_id, youtubeApiKey, nextPageToken);
          
          if (result.quotaExceeded) {
            console.log('Quota exceeded while fetching videos');
            throw new Error('YouTube API quota exceeded');
          }

          allVideos = [...allVideos, ...result.videos];
          nextPageToken = result.nextPageToken;

          // Small delay between requests
          if (nextPageToken) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } while (nextPageToken);

        console.log(`Found ${allVideos.length} videos for channel ${channel.channel_id}`);

        if (allVideos.length > 0) {
          // Store videos in database
          const { error: upsertError } = await supabase
            .from('youtube_videos')
            .upsert(
              allVideos,
              { onConflict: 'video_id' }
            );

          if (upsertError) {
            throw new Error(`Failed to store videos: ${upsertError.message}`);
          }
        }

        // Update channel's last_fetch timestamp
        await supabase
          .from('youtube_channels')
          .update({ 
            last_fetch: new Date().toISOString(),
            fetch_error: null
          })
          .eq('channel_id', channel.channel_id);

        results.push({
          channelId: channel.channel_id,
          videosCount: allVideos.length,
          success: true
        });

      } catch (error) {
        console.error(`Error processing channel ${channel.channel_id}:`, error);
        
        // Update channel with error
        await supabase
          .from('youtube_channels')
          .update({ 
            last_fetch: new Date().toISOString(),
            fetch_error: error.message
          })
          .eq('channel_id', channel.channel_id);

        results.push({
          channelId: channel.channel_id,
          error: error.message,
          success: false
        });

        // If it's a quota error, stop processing more channels
        if (error.message.includes('quota')) {
          break;
        }
      }

      // Add delay between channels
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        processedChannels: channels?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
