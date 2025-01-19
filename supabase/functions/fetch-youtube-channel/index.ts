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
    console.log('[YouTube API] Processing username:', cleaned);
    return cleaned;
  }
  
  // Handle direct channel IDs (starting with UC)
  if (cleaned.startsWith('UC')) {
    console.log('[YouTube API] Using channel ID directly:', cleaned);
    return cleaned;
  }
  
  console.log('[YouTube API] Using input as channel handle:', cleaned);
  return cleaned;
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

    const processedChannelId = extractChannelId(channelId);
    console.log('[YouTube API] Processed channel ID:', processedChannelId);

    // Try different API endpoints in sequence
    let channelData = null;

    // 1. First try with direct channel ID
    if (processedChannelId.startsWith('UC')) {
      console.log('[YouTube API] Trying direct channel ID lookup');
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${processedChannelId}&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      if (data.items?.length > 0) {
        channelData = data;
      }
    }

    // 2. If not found, try with username
    if (!channelData) {
      console.log('[YouTube API] Trying username lookup');
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forUsername=${processedChannelId.replace('@', '')}&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      if (data.items?.length > 0) {
        channelData = data;
      }
    }

    // 3. If still not found, try search
    if (!channelData) {
      console.log('[YouTube API] Trying search lookup');
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${processedChannelId}&key=${YOUTUBE_API_KEY}`
      );
      const searchData = await searchResponse.json();
      
      if (searchData.items?.length > 0) {
        const channelId = searchData.items[0].id.channelId;
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
        );
        channelData = await response.json();
      }
    }

    if (!channelData || !channelData.items || channelData.items.length === 0) {
      console.error('[YouTube API] Channel not found after all attempts');
      return new Response(
        JSON.stringify({ 
          error: 'Channel not found',
          details: 'Could not find a YouTube channel with the provided ID/URL. Please try using the full channel URL or ID.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const channel = channelData.items[0];
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