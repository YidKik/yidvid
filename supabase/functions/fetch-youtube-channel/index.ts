import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

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
    const { channelId } = await req.json();

    if (!channelId) {
      return new Response(
        JSON.stringify({ error: 'Channel ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Clean the channel ID by removing any whitespace
    const cleanChannelId = channelId.trim();
    console.log('Fetching channel details for ID:', cleanChannelId);

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${cleanChannelId}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      console.error('YouTube API Error:', await response.text());
      return new Response(
        JSON.stringify({ error: 'Failed to fetch channel from YouTube API' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }

    const data = await response.json();
    console.log('YouTube API Response:', JSON.stringify(data));
    
    if (!data.items || data.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Channel not found. Please verify the channel ID.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const channel = data.items[0].snippet;
    
    return new Response(
      JSON.stringify({
        title: channel.title,
        description: channel.description,
        thumbnailUrl: channel.thumbnails?.default?.url
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch channel details',
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});