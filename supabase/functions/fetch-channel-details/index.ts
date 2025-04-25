
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0';
import { corsHeaders } from '../_shared/cors.ts';

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Create supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channelId } = await req.json();

    if (!channelId) {
      return new Response(
        JSON.stringify({ error: 'channelId is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!YOUTUBE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log("Fetching channel details from YouTube API for:", channelId);
    
    // Format query based on channelId format
    let apiUrl = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&key=${YOUTUBE_API_KEY}`;
    if (channelId.startsWith('@')) {
      apiUrl += `&forHandle=${channelId.substring(1)}`;
    } else {
      apiUrl += `&id=${channelId}`;
    }
    
    // Make request to YouTube API with robust headers
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 Supabase Edge Function',
        'Referer': 'https://yidvid.com',
        'Origin': 'https://yidvid.com',
        'X-Request-Source': 'Supabase Edge Function'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("YouTube API error:", response.status, response.statusText);
      console.error("Error details:", errorText);
      
      return new Response(
        JSON.stringify({ 
          error: `YouTube API error: ${response.status} ${response.statusText}`, 
          details: errorText 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Channel not found on YouTube' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    const channelData = data.items[0];
    
    // Format channel data to match our database structure
    const formattedChannel = {
      channel_id: channelData.id,
      title: channelData.snippet.title,
      description: channelData.snippet.description,
      thumbnail_url: channelData.snippet.thumbnails?.default?.url,
    };
    
    // Insert the channel into our database if it doesn't exist
    try {
      const { data: insertedChannel, error: insertError } = await supabase
        .from('youtube_channels')
        .upsert({
          channel_id: formattedChannel.channel_id,
          title: formattedChannel.title,
          description: formattedChannel.description || '',
          thumbnail_url: formattedChannel.thumbnail_url,
        })
        .select()
        .single();
        
      if (insertError) {
        console.error("Error saving channel to database:", insertError);
      } else {
        console.log("Channel saved to database:", insertedChannel);
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
    }
    
    return new Response(
      JSON.stringify({ channel: formattedChannel, status: 'success' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error("Edge function error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message, status: 'error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
