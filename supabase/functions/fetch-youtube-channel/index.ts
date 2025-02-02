import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchChannelData(channelIdentifier: string, apiKey: string) {
  console.log('[YouTube API] Starting channel fetch for:', channelIdentifier);
  
  // Clean up the channel identifier
  let cleanedIdentifier = channelIdentifier.trim();
  
  // Handle YouTube URLs
  try {
    if (cleanedIdentifier.includes('youtube.com') || cleanedIdentifier.includes('youtu.be')) {
      const url = new URL(cleanedIdentifier);
      if (url.pathname.includes('/channel/')) {
        cleanedIdentifier = url.pathname.split('/channel/')[1].split('/')[0];
      } else if (url.pathname.includes('/@')) {
        cleanedIdentifier = url.pathname.split('/@')[1].split('/')[0];
      } else if (url.pathname.includes('/c/')) {
        cleanedIdentifier = url.pathname.split('/c/')[1].split('/')[0];
      } else if (url.pathname.includes('/user/')) {
        cleanedIdentifier = url.pathname.split('/user/')[1].split('/')[0];
      }
    }
  } catch (error) {
    console.error('[YouTube API] URL parsing error:', error);
  }

  // Remove @ symbol if present
  if (cleanedIdentifier.startsWith('@')) {
    cleanedIdentifier = cleanedIdentifier.substring(1);
  }

  console.log('[YouTube API] Cleaned identifier:', cleanedIdentifier);

  // Try different methods to fetch the channel
  const methods = [
    // 1. Direct channel ID lookup
    async () => {
      if (cleanedIdentifier.startsWith('UC')) {
        console.log('[YouTube API] Trying direct channel ID lookup');
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${cleanedIdentifier}&key=${apiKey}`
        );
        const data = await response.json();
        if (data.items?.length > 0) return data;
      }
      return null;
    },
    
    // 2. Username lookup
    async () => {
      console.log('[YouTube API] Trying username lookup');
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername=${cleanedIdentifier}&key=${apiKey}`
      );
      const data = await response.json();
      if (data.items?.length > 0) return data;
      return null;
    },
    
    // 3. Search as last resort
    async () => {
      console.log('[YouTube API] Trying search lookup');
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${cleanedIdentifier}&key=${apiKey}`
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

  for (const method of methods) {
    try {
      const data = await method();
      if (data?.items?.length > 0) {
        console.log('[YouTube API] Successfully found channel');
        return data;
      }
    } catch (error) {
      console.error('[YouTube API] Method error:', error);
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

    console.log('[YouTube API] Processing channel identifier:', channelId);

    const channelData = await fetchChannelData(channelId, YOUTUBE_API_KEY);
    
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