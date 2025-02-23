
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    // Parse the request body
    const requestBody = await req.text();
    console.log("Raw request body:", requestBody);

    let body;
    try {
      body = requestBody ? JSON.parse(requestBody) : {};
    } catch (e) {
      console.error("Error parsing JSON:", e);
      console.error("Invalid JSON content:", requestBody);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { channelId } = body;
    console.log("Received channel ID:", channelId);

    if (!channelId) {
      return new Response(
        JSON.stringify({ error: "Channel ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      console.error("YouTube API key not configured");
      return new Response(
        JSON.stringify({ error: "YouTube API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Clean the channel ID - remove any @ symbol and handle custom URLs
    const cleanChannelId = channelId.startsWith('@') ? channelId.substring(1) : channelId;

    // First try to get channel by custom URL (handle if channelId is a username)
    let apiUrl;
    if (cleanChannelId.startsWith('UC')) {
      // If it's a channel ID, use channels endpoint directly
      apiUrl = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=${cleanChannelId}&key=${YOUTUBE_API_KEY}`;
      console.log("Using direct channel ID endpoint");
    } else {
      // If it's a username or custom URL, search for the channel
      apiUrl = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${cleanChannelId}&type=channel&key=${YOUTUBE_API_KEY}`;
      console.log("Using search endpoint to find channel");
    }

    console.log("Fetching from YouTube API:", apiUrl.replace(YOUTUBE_API_KEY, 'REDACTED'));
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("YouTube API error response:", errorData);

      // Handle quota exceeded error specifically
      if (errorData.error?.message?.includes("quota")) {
        return new Response(
          JSON.stringify({ 
            error: "YouTube API quota exceeded. Please try again later.",
            quota_exceeded: true
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: `YouTube API error: ${errorData.error?.message || 'Unknown error'}`,
          details: errorData.error 
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Add error handling for YouTube API response parsing
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("Error parsing YouTube API response:", e);
      return new Response(
        JSON.stringify({ error: "Invalid response from YouTube API" }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let channelData;
    if (cleanChannelId.startsWith('UC')) {
      channelData = data.items?.[0];
    } else {
      // If we searched by username, we need to get the first result's channel ID
      if (!data.items || data.items.length === 0) {
        console.error("No channel found for query:", cleanChannelId);
        return new Response(
          JSON.stringify({ error: "Channel not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      console.log("Found channel in search results, fetching details");
      const foundChannelId = data.items[0].id.channelId;
      
      // Now fetch the actual channel data
      const channelResponse = await fetch(
        `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=${foundChannelId}&key=${YOUTUBE_API_KEY}`
      );

      if (!channelResponse.ok) {
        const channelError = await channelResponse.json();
        console.error("Error fetching channel details:", channelError);
        return new Response(
          JSON.stringify({ 
            error: `Error fetching channel details: ${channelError.error?.message || 'Unknown error'}` 
          }),
          {
            status: channelResponse.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      try {
        const channelResult = await channelResponse.json();
        channelData = channelResult.items?.[0];
      } catch (e) {
        console.error("Error parsing channel details response:", e);
        return new Response(
          JSON.stringify({ error: "Invalid response while fetching channel details" }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    if (!channelData) {
      console.error("No channel data found");
      return new Response(
        JSON.stringify({ error: "Channel not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log("Successfully fetched channel data for:", channelData.snippet.title);
    
    const result = {
      channelId: channelData.id,
      title: channelData.snippet.title,
      description: channelData.snippet.description,
      thumbnailUrl: channelData.snippet.thumbnails.default.url,
      default_category: 'other'
    };

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in fetch-youtube-channel function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred while fetching the channel',
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
