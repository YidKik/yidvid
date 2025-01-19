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
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not configured');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all channels without thumbnails
    const { data: channels, error: fetchError } = await supabase
      .from('youtube_channels')
      .select('channel_id, thumbnail_url')
      .is('thumbnail_url', null);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${channels?.length || 0} channels without thumbnails`);

    if (!channels?.length) {
      return new Response(
        JSON.stringify({ message: 'No channels need updating' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process channels in batches of 50 (YouTube API limit)
    const batchSize = 50;
    const batches = [];
    for (let i = 0; i < channels.length; i += batchSize) {
      batches.push(channels.slice(i, i + batchSize));
    }

    let updatedCount = 0;
    for (const batch of batches) {
      const channelIds = batch.map(c => c.channel_id).join(',');
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelIds}&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${await response.text()}`);
      }

      const data = await response.json();
      
      // Update each channel's thumbnail in the database
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
            updatedCount++;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Successfully updated ${updatedCount} channel thumbnails`,
        updated: updatedCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});