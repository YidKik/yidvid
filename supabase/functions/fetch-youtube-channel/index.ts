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
    console.log('[YouTube API] Starting channel fetch process');
    console.log('[YouTube API] API Key present:', !!YOUTUBE_API_KEY);
    console.log('[YouTube API] Channel ID received:', channelId);

    if (!channelId) {
      console.error('[YouTube API] No channel ID provided');
      return new Response(
        JSON.stringify({ error: 'Channel ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!YOUTUBE_API_KEY) {
      console.error('[YouTube API] API key not configured');
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Try different channel ID formats
    let cleanChannelId = channelId.trim();
    
    // If it's a channel URL, extract the ID
    if (cleanChannelId.includes('youtube.com')) {
      const urlMatch = cleanChannelId.match(/(?:\/channel\/|\/c\/|\/user\/)([\w-]+)/);
      if (urlMatch) {
        cleanChannelId = urlMatch[1];
      }
    }
    
    // Remove any remaining special characters
    cleanChannelId = cleanChannelId.replace(/[^\w-]/g, '');
    
    console.log('[YouTube API] Cleaned channel ID:', cleanChannelId);
    
    // First try with channel ID
    let apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${cleanChannelId}&key=${YOUTUBE_API_KEY}`;
    console.log('[YouTube API] Making request to:', apiUrl.replace(YOUTUBE_API_KEY, '[REDACTED]'));

    let response = await fetch(apiUrl);
    let data = await response.json();
    
    // If no results, try with username
    if (!data.items || data.items.length === 0) {
      console.log('[YouTube API] No results with ID, trying forUsername');
      apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername=${cleanChannelId}&key=${YOUTUBE_API_KEY}`;
      console.log('[YouTube API] Making request to:', apiUrl.replace(YOUTUBE_API_KEY, '[REDACTED]'));
      
      response = await fetch(apiUrl);
      data = await response.json();
    }

    if (!response.ok) {
      console.error('[YouTube API] Error Response:', JSON.stringify(data));
      console.error('[YouTube API] Status:', response.status);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch channel from YouTube API',
          details: `YouTube API returned status ${response.status}`,
          response: JSON.stringify(data)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }

    if (!data.items || data.items.length === 0) {
      console.error('[YouTube API] Channel not found:', cleanChannelId);
      return new Response(
        JSON.stringify({ 
          error: 'Channel not found',
          details: 'Please verify the channel ID is correct. You can try using the channel URL or username instead.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const channel = data.items[0].snippet;
    console.log('[YouTube API] Successfully fetched channel:', channel.title);
    
    const thumbnailUrl = channel.thumbnails?.high?.url || 
                        channel.thumbnails?.medium?.url || 
                        channel.thumbnails?.default?.url;
    
    return new Response(
      JSON.stringify({
        title: channel.title,
        description: channel.description,
        thumbnailUrl: thumbnailUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[YouTube API] Error in edge function:', error);
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