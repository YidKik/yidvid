
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
    let channels;
    try {
      const body = await req.json();
      channels = body.channels;
      
      if (!channels || !Array.isArray(channels)) {
        throw new Error('Invalid channels data');
      }
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log('Updating thumbnails for channels:', channels);

    // Process channels in batches to avoid rate limits
    const batchSize = 50; // YouTube API allows up to 50 channels per request
    const results = [];
    
    for (let i = 0; i < channels.length; i += batchSize) {
      const channelBatch = channels.slice(i, i + batchSize);
      const channelIds = channelBatch.join(',');
      
      try {
        console.log(`Processing batch ${i / batchSize + 1} of channels:`, channelBatch);
        
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelIds}&key=${YOUTUBE_API_KEY}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('YouTube API error response:', errorText);
          
          // If we hit quota, stop but don't throw error
          if (errorText.includes('quotaExceeded')) {
            console.log('YouTube API quota exceeded, stopping batch processing');
            break;
          }
          
          throw new Error(`YouTube API error: ${errorText}`);
        }

        const data = await response.json();
        
        // Update thumbnails in database
        for (const item of data.items || []) {
          const thumbnailUrl = item.snippet.thumbnails?.default?.url ||
                              item.snippet.thumbnails?.medium?.url ||
                              item.snippet.thumbnails?.high?.url;
          
          if (thumbnailUrl) {
            try {
              const { error: updateError } = await supabase
                .from('youtube_channels')
                .update({ thumbnail_url: thumbnailUrl })
                .eq('channel_id', item.id);

              if (updateError) {
                console.error(`Error updating channel ${item.id}:`, updateError);
              } else {
                console.log(`Updated thumbnail for channel ${item.id}`);
                results.push(item.id);
              }
            } catch (dbError) {
              console.error(`Database error for channel ${item.id}:`, dbError);
            }
          }
        }

        // Add delay between batches to avoid rate limiting
        if (i + batchSize < channels.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (batchError) {
        console.error(`Error processing batch starting at index ${i}:`, batchError);
        // Continue with next batch instead of failing completely
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Successfully processed ${results.length} channels`,
        updated_channels: results
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
        error: error.message,
        success: false,
        message: 'An error occurred while updating channel thumbnails'
      }),
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
