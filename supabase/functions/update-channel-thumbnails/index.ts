
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not configured');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { channels } = await req.json();
    
    if (!channels || !Array.isArray(channels)) {
      throw new Error('Invalid channels data');
    }

    console.log('Updating thumbnails for channels:', channels);

    // Fetch channel details from YouTube API
    const channelIds = channels.join(',');
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelIds}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${await response.text()}`);
    }

    const data = await response.json();
    
    // Update thumbnails in database
    for (const item of data.items || []) {
      const thumbnailUrl = item.snippet.thumbnails?.default?.url ||
                          item.snippet.thumbnails?.medium?.url ||
                          item.snippet.thumbnails?.high?.url;
      
      if (thumbnailUrl) {
        const { error: updateError } = await supabase
          .from('youtube_channels')
          .update({ thumbnail_url: thumbnailUrl })
          .eq('channel_id', item.id);

        if (updateError) {
          console.error(`Error updating channel ${item.id}:`, updateError);
        } else {
          console.log(`Updated thumbnail for channel ${item.id}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Successfully processed ${data.items?.length || 0} channels`,
        processed: data.items?.length || 0
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
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});
