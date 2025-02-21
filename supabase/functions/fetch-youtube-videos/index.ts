
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { processChannel } from './channel-processor.ts';
import { checkAndUpdateQuota } from './quota-manager.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) {
      throw new Error('YouTube API key not configured');
    }

    // Check quota before processing
    console.log('Checking quota status...');
    const { canProceed, quotaData } = await checkAndUpdateQuota(supabaseClient);

    if (!canProceed) {
      console.log('Quota exceeded, returning error response');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'YouTube API quota exceeded',
          message: `Daily quota exceeded. Service will resume at ${new Date(quotaData.quota_reset_at).toUTCString()}`,
          quota_reset_at: quotaData.quota_reset_at
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429
        }
      );
    }

    const { channels = [], forceUpdate = false } = await req.json();
    const now = new Date();
    
    console.log(`Processing ${channels.length} channels with forceUpdate=${forceUpdate}`);

    const results = [];
    let newVideosCount = 0;

    for (const channelId of channels) {
      try {
        const result = await processChannel(
          supabaseClient,
          channelId,
          apiKey,
          quotaData,
          now
        );
        results.push({ channelId, success: true, videos: result.videos.length });
        newVideosCount += result.videos.length;
      } catch (error) {
        console.error(`Error processing channel ${channelId}:`, error);
        results.push({ channelId, success: false, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: channels.length,
        newVideos: newVideosCount,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in fetch-youtube-videos function:', error);
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
