
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
    const channelUrl = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    let response = await fetch(channelUrl);
    let data = await response.json();

    // If no results, try searching by custom URL/username
    if (!data.items?.length) {
      const searchUrl = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${channelId}&type=channel&key=${YOUTUBE_API_KEY}`;
      response = await fetch(searchUrl);
      data = await response.json();

      if (!data.items?.length) {
        throw new Error("Channel not found");
      }

      // Get full channel details using the found channel ID
      const foundChannelId = data.items[0].snippet.channelId;
      response = await fetch(`https://youtube.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${foundChannelId}&key=${YOUTUBE_API_KEY}`);
      data = await response.json();
    }

    if (!data.items?.length) {
      throw new Error("Could not find channel details");
    }

    const channel = data.items[0];
    const channelData = {
      channelId: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnailUrl: channel.snippet.thumbnails.default?.url,
      default_category: 'other'
    };

    console.log("Successfully fetched channel:", channelData.title);

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
    
    // Check for specific YouTube API errors
    if (error.response?.error?.message) {
      return new Response(
        JSON.stringify({ 
          error: "YouTube API error", 
          details: error.response.error.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Return a structured error response
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred",
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.status || 500 
      }
    );
  }
});
