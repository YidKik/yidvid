import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function extractChannelId(input: string): string {
  console.log('[YouTube API] Processing input:', input);
  const cleaned = input.trim();
  
  // Handle full URLs
  if (cleaned.includes('youtube.com')) {
    const urlPatterns = [
      /youtube\.com\/channel\/([\w-]+)/,
      /youtube\.com\/c\/([\w-]+)/,
      /youtube\.com\/@([\w-]+)/,
      /youtube\.com\/user\/([\w-]+)/
    ];

    for (const pattern of urlPatterns) {
      const match = cleaned.match(pattern);
      if (match) {
        console.log('[YouTube API] Extracted channel ID from URL:', match[1]);
        return match[1];
      }
    }
  }
  
  // Handle @username format
  if (cleaned.startsWith('@')) {
    console.log('[YouTube API] Processing username:', cleaned.substring(1));
    return cleaned.substring(1);
  }
  
  console.log('[YouTube API] Using raw input as channel ID:', cleaned);
  return cleaned;
}

serve(async (req) => {
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

    const processedChannelId = extractChannelId(channelId);
    console.log('[YouTube API] Processed channel ID:', processedChannelId);

    // First try with channel ID
    let apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${processedChannelId}&key=${YOUTUBE_API_KEY}`;
    console.log('[YouTube API] Making request with ID:', processedChannelId);

    let response = await fetch(apiUrl);
    let data = await response.json();
    
    // If no results, try with username/handle
    if (!data.items || data.items.length === 0) {
      console.log('[YouTube API] No results with ID, trying with forUsername');
      apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forUsername=${processedChannelId}&key=${YOUTUBE_API_KEY}`;
      response = await fetch(apiUrl);
      data = await response.json();
      
      // If still no results, try search
      if (!data.items || data.items.length === 0) {
        console.log('[YouTube API] No results with username, trying search');
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${processedChannelId}&key=${YOUTUBE_API_KEY}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        
        if (searchData.items?.length > 0) {
          const channelId = searchData.items[0].id.channelId;
          apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
          response = await fetch(apiUrl);
          data = await response.json();
        }
      }
    }

    if (!response.ok) {
      console.error('[YouTube API] Error Response:', data);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch channel from YouTube API',
          details: data.error?.message || 'Unknown error'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }

    if (!data.items || data.items.length === 0) {
      console.error('[YouTube API] Channel not found:', processedChannelId);
      return new Response(
        JSON.stringify({ 
          error: 'Channel not found',
          details: 'Could not find a YouTube channel with the provided ID/URL'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const channel = data.items[0];
    console.log('[YouTube API] Successfully fetched channel:', channel.snippet.title);
    
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