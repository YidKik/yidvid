
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      console.error("YouTube API key not found");
      throw new Error("YouTube API key not configured");
    }

    const { channelId } = await req.json();
    console.log("Processing channel ID:", channelId);

    if (!channelId) {
      throw new Error("No channel ID provided");
    }

    // First try to get channel by ID
    const channelUrl = new URL('https://youtube.googleapis.com/youtube/v3/channels');
    channelUrl.searchParams.append('part', 'snippet,statistics');
    channelUrl.searchParams.append('id', channelId);
    channelUrl.searchParams.append('key', YOUTUBE_API_KEY);

    console.log("Fetching channel from URL:", channelUrl.toString());
    
    let response = await fetch(channelUrl);
    let data = await response.json();
    console.log("Initial API response:", data);

    // If no results, try searching by custom URL/username
    if (!data.items?.length) {
      console.log("No channel found by ID, trying search...");
      const searchUrl = new URL('https://youtube.googleapis.com/youtube/v3/search');
      searchUrl.searchParams.append('part', 'snippet');
      searchUrl.searchParams.append('q', channelId);
      searchUrl.searchParams.append('type', 'channel');
      searchUrl.searchParams.append('key', YOUTUBE_API_KEY);

      console.log("Searching channel with URL:", searchUrl.toString());
      response = await fetch(searchUrl);
      data = await response.json();
      console.log("Search API response:", data);

      if (!data.items?.length) {
        throw new Error("Channel not found");
      }

      // Get full channel details using the found channel ID
      const foundChannelId = data.items[0].snippet.channelId;
      channelUrl.searchParams.set('id', foundChannelId);
      
      console.log("Fetching full channel details for:", foundChannelId);
      response = await fetch(channelUrl);
      data = await response.json();
      console.log("Final API response:", data);
    }

    if (!data.items?.length) {
      throw new Error("Could not find channel details");
    }

    const channel = data.items[0];
    const channelData = {
      channelId: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description || '',
      thumbnailUrl: channel.snippet.thumbnails?.default?.url || '',
      default_category: 'other'
    };

    console.log("Successfully processed channel data:", channelData);

    return new Response(
      JSON.stringify(channelData),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error in edge function:", error);
    
    let status = 500;
    let message = error.message || "An unexpected error occurred";
    
    // YouTube API specific error handling
    if (error.response?.error) {
      status = error.response.error.code || 400;
      message = error.response.error.message || message;
      
      if (message.includes("quota")) {
        message = "YouTube API quota exceeded. Please try again later.";
      } else if (message.includes("403")) {
        message = "Access to YouTube API denied. Please check API key configuration.";
      }
    }

    return new Response(
      JSON.stringify({ 
        error: message,
        details: error.stack || ''
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status 
      }
    );
  }
});
