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
    console.log('Received request with channelId:', channelId);

    if (!channelId) {
      console.error('No channel ID provided');
      return new Response(
        JSON.stringify({ error: 'Channel ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!YOUTUBE_API_KEY) {
      console.error('YouTube API key not configured');
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Clean the channel ID by removing any whitespace and special characters
    const cleanChannelId = channelId.trim().replace(/[^\w-]/g, '');
    console.log('Fetching channel details for ID:', cleanChannelId);

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${cleanChannelId}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube API Error Response:', errorText);
      console.error('YouTube API Status:', response.status);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch channel from YouTube API',
          details: `YouTube API returned status ${response.status}`,
          response: errorText
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }

    const data = await response.json();
    console.log('YouTube API Response:', JSON.stringify(data));
    
    if (!data.items || data.items.length === 0) {
      console.error('Channel not found:', cleanChannelId);
      return new Response(
        JSON.stringify({ 
          error: 'Channel not found',
          details: 'Please verify the channel ID is correct'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const channel = data.items[0].snippet;
    console.log('Successfully fetched channel:', channel.title);
    
    return new Response(
      JSON.stringify({
        title: channel.title,
        description: channel.description,
        thumbnailUrl: channel.thumbnails?.default?.url
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in edge function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch channel details',
        details: error.message,
        stack: error.stack
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});