
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

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
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get channels to process
    const { data: channels, error: channelsError } = await supabase
      .from('youtube_channels')
      .select('channel_id, title')
      .is('deleted_at', null)
      .is('fetch_error', null);

    if (channelsError) {
      throw channelsError;
    }

    if (!channels || channels.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No channels to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${channels.length} channels`);

    // Process each channel
    for (const channel of channels) {
      try {
        console.log(`Fetching videos for channel: ${channel.channel_id}`);
        
        // Log the start of update
        const { error: logError } = await supabase
          .from('youtube_update_logs')
          .insert({
            channel_id: channel.channel_id,
            videos_count: 0
          });

        if (logError) {
          console.error('Error logging update:', logError);
        }

        // TODO: Implement actual YouTube API call here
        // For now, just update the channel's last_fetch timestamp
        const { error: updateError } = await supabase
          .from('youtube_channels')
          .update({ 
            last_fetch: new Date().toISOString(),
            fetch_error: null
          })
          .eq('channel_id', channel.channel_id);

        if (updateError) {
          throw updateError;
        }

      } catch (error) {
        console.error(`Error processing channel ${channel.channel_id}:`, error);
        
        // Log error in youtube_update_logs
        await supabase
          .from('youtube_update_logs')
          .insert({
            channel_id: channel.channel_id,
            error: error.message
          });

        // Update channel with error
        await supabase
          .from('youtube_channels')
          .update({ 
            fetch_error: error.message,
            last_fetch: new Date().toISOString()
          })
          .eq('channel_id', channel.channel_id);
      }

      // Add delay between processing channels
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Channel processing complete',
        processed: channels.length
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
