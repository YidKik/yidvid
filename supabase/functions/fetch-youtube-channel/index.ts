import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function extractChannelId(input: string): string {
  console.log('[YouTube API] Processing input:', input);
  const cleaned = input.trim();
  
  // Handle YouTube URLs
  try {
    if (cleaned.includes('youtube.com') || cleaned.includes('youtu.be')) {
      const url = new URL(cleaned);
      
      // Handle different URL formats
      if (url.pathname.includes('/channel/')) {
        return url.pathname.split('/channel/')[1].split('/')[0];
      }
      if (url.pathname.includes('/@')) {
        return url.pathname.split('/@')[1].split('/')[0];
      }
      if (url.pathname.includes('/c/')) {
        return url.pathname.split('/c/')[1].split('/')[0];
      }
      if (url.pathname.includes('/user/')) {
        return url.pathname.split('/user/')[1].split('/')[0];
      }
    }
    
    // Handle @username format
    if (cleaned.startsWith('@')) {
      console.log('[YouTube API] Processing username:', cleaned);
      return cleaned.substring(1); // Remove @ for API call
    }
    
    // Handle direct channel IDs
    if (cleaned.startsWith('UC')) {
      console.log('[YouTube API] Using channel ID directly:', cleaned);
      return cleaned;
    }
    
    // If none of the above, treat as username
    console.log('[YouTube API] Using input as channel handle:', cleaned);
    return cleaned;
  } catch (error) {
    console.error("[YouTube API] Error parsing channel input:", error);
    return cleaned;
  }
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

    // 1. First try search to handle usernames and custom URLs
    console.log('[YouTube API] Trying search lookup first');
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${processedChannelId}&key=${YOUTUBE_API_KEY}`
    );
    const searchData = await searchResponse.json();
    
    if (searchData.items?.length > 0) {
      const channelId = searchData.items[0].id.channelId;
      console.log('[YouTube API] Found channel via search:', channelId);
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
      );
      channelData = await response.json();
    }

    // 2. If not found, try with direct channel ID
    if (!channelData && processedChannelId.startsWith('UC')) {
      console.log('[YouTube API] Trying direct channel ID lookup');
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${processedChannelId}&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      if (data.items?.length > 0) {
        channelData = data;
      }
    }

    // 3. If still not found, try with legacy username endpoint
    if (!channelData) {
      console.log('[YouTube API] Trying username lookup');
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forUsername=${processedChannelId}&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      if (data.items?.length > 0) {
        channelData = data;
      }
    }

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