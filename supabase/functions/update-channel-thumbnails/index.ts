
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase configuration missing' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body with error handling
    let channels;
    try {
      if (!req.body) {
        throw new Error('Request body is empty');
      }
      const body = await req.json();
      channels = body.channels;
      
      if (!channels || !Array.isArray(channels) || channels.length === 0) {
        throw new Error('Invalid or empty channels array');
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request format',
          details: error.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Process channels in smaller batches
    const batchSize = 25; // Reduced from 50 to avoid timeout issues
    const results = [];
    
    for (let i = 0; i < channels.length; i += batchSize) {
      const channelBatch = channels.slice(i, i + batchSize);
      const channelIds = channelBatch.join(',');
      
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelIds}&key=${YOUTUBE_API_KEY}`,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          if (errorText.includes('quotaExceeded')) {
            return new Response(
              JSON.stringify({ 
                warning: 'YouTube API quota exceeded',
                processed: results 
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 429
              }
            );
          }
          throw new Error(`YouTube API error: ${errorText}`);
        }

        const data = await response.json();
        
        for (const item of data.items || []) {
          const thumbnailUrl = item.snippet?.thumbnails?.default?.url ||
                              item.snippet?.thumbnails?.medium?.url ||
                              item.snippet?.thumbnails?.high?.url;
          
          if (thumbnailUrl) {
            const { error: updateError } = await supabase
              .from('youtube_channels')
              .update({ thumbnail_url: thumbnailUrl })
              .eq('channel_id', item.id);

            if (!updateError) {
              results.push(item.id);
            }
          }
        }

        // Add delay between batches
        if (i + batchSize < channels.length) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } catch (batchError) {
        console.error(`Batch error:`, batchError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Updated ${results.length} channels`,
        updated_channels: results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
