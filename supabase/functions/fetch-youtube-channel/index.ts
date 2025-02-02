import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchChannelData(channelId: string, apiKey: string) {
  console.log('[YouTube API] Attempting to fetch channel:', channelId);
  
  // Try different API endpoints in sequence
  const endpoints = [
    // 1. Direct channel ID lookup
    async () => {
      if (channelId.startsWith('UC')) {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`
        );
        return await response.json();
      }
      return null;
    },
    // 2. Search endpoint for handles and custom URLs
    async () => {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${channelId}&key=${apiKey}`
      );
      const data = await response.json();
      if (data.items?.length > 0) {
        const channelId = data.items[0].id.channelId;
        const channelResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`
        );
        return await channelResponse.json();
      }
      return null;
    },
    // 3. Legacy username endpoint
    async () => {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forUsername=${channelId}&key=${apiKey}`
      );
      return await response.json();
    }
  ];

  for (const endpoint of endpoints) {
    try {
      const data = await endpoint();
      if (data?.items?.length > 0) {
        console.log('[YouTube API] Successfully found channel via endpoint');
        return data;
      }
    } catch (error) {
      console.error('[YouTube API] Endpoint error:', error);
    }
  }

  throw new Error('Channel not found');
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channelId } = await req.json();
    console.log('[YouTube API] Starting channel fetch process');
    console.log('[YouTube API] Original channel ID/URL received:', channelId);

    if (!channelId) {
      console.error('[YouTube API] No channel ID provided');
      return new Response(
        JSON.stringify({ error: 'Channel ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      console.error('[YouTube API] Missing YouTube API key');
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const channelData = await fetchChannelData(channelId, YOUTUBE_API_KEY);
    
    if (!channelData || !channelData.items || channelData.items.length === 0) {
      console.error('[YouTube API] Channel not found after all attempts');
      return new Response(
        JSON.stringify({ 
          error: 'Channel not found',
          details: 'Could not find a YouTube channel with the provided ID/URL. Please try using a different format like the full channel URL, @handle, or channel ID.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const channel = channelData.items[0];
    console.log('[YouTube API] Successfully fetched channel:', channel.snippet.title);
    
    // Get the highest quality thumbnail available
    const thumbnailUrl = channel.snippet.thumbnails?.high?.url || 
                        channel.snippet.thumbnails?.medium?.url || 
                        channel.snippet.thumbnails?.default?.url;
    
    return new Response(
      JSON.stringify({
        title: channel.snippet.title,
        description: channel.snippet.description,
        thumbnailUrl: thumbnailUrl,
        statistics: channel.statistics,
        channelId: channel.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[YouTube API] Error in edge function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch channel details',
        details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});