import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchChannelData(channelIdentifier: string, apiKey: string) {
  console.log('[YouTube API] Starting channel fetch for:', channelIdentifier);
  
  const endpoints = [
    // 1. Direct channel ID lookup
    async () => {
      if (channelIdentifier.startsWith('UC')) {
        console.log('[YouTube API] Trying direct channel ID lookup');
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelIdentifier}&key=${apiKey}`
        );
        const data = await response.json();
        if (data.items?.length > 0) return data;
      }
      return null;
    },
    
    // 2. Handle custom URLs and handles
    async () => {
      console.log('[YouTube API] Trying custom URL/handle lookup');
      let forUsername = channelIdentifier;
      if (channelIdentifier.startsWith('@')) {
        forUsername = channelIdentifier.substring(1);
      }
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername=${forUsername}&key=${apiKey}`
      );
      const data = await response.json();
      if (data.items?.length > 0) return data;
      return null;
    },
    
    // 3. Search as last resort
    async () => {
      console.log('[YouTube API] Trying search lookup');
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${channelIdentifier}&key=${apiKey}`
      );
      const data = await response.json();
      if (data.items?.length > 0) {
        const channelId = data.items[0].snippet.channelId;
        const channelResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`
        );
        return await channelResponse.json();
      }
      return null;
    }
  ];

  for (const endpoint of endpoints) {
    try {
      const data = await endpoint();
      if (data?.items?.length > 0) {
        console.log('[YouTube API] Successfully found channel');
        return data;
      }
    } catch (error) {
      console.error('[YouTube API] Endpoint error:', error);
    }
  }

  throw new Error('Channel not found');
}

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

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      console.error('[YouTube API] Missing API key');
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Clean the channel ID/URL
    const cleanedChannelId = channelId.trim();
    console.log('[YouTube API] Processing channel identifier:', cleanedChannelId);

    const channelData = await fetchChannelData(cleanedChannelId, YOUTUBE_API_KEY);
    
    if (!channelData?.items?.[0]) {
      return new Response(
        JSON.stringify({ 
          error: 'Channel not found',
          details: 'Could not find a YouTube channel with the provided ID/URL. Please try using a different format like the full channel URL, @handle, or channel ID.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const channel = channelData.items[0];
    const thumbnailUrl = channel.snippet.thumbnails?.high?.url || 
                        channel.snippet.thumbnails?.medium?.url || 
                        channel.snippet.thumbnails?.default?.url;

    return new Response(
      JSON.stringify({
        channelId: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        thumbnailUrl: thumbnailUrl,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[YouTube API] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch channel details',
        details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});