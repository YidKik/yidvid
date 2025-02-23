
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
    // First, verify API key is available
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      console.error("YouTube API key is not configured");
      return new Response(
        JSON.stringify({ error: "YouTube API key is not configured in the environment" }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Test YouTube API key with a simple request
    const testUrl = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=UC_x5XG1OV2P6uZZ5FSM9Ttw&key=${YOUTUBE_API_KEY}`;
    console.log("Testing YouTube API key with a simple request");
    
    const testResponse = await fetch(testUrl);
    if (!testResponse.ok) {
      const errorData = await testResponse.json();
      console.error("YouTube API key validation failed:", errorData);
      return new Response(
        JSON.stringify({ 
          error: "YouTube API key validation failed",
          details: errorData.error || 'Unknown error'
        }),
        {
          status: testResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse the request body
    const requestBody = await req.text();
    console.log("Raw request body:", requestBody);

    let body;
    try {
      body = requestBody ? JSON.parse(requestBody) : {};
    } catch (e) {
      console.error("Error parsing JSON:", e);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { channelId } = body;
    console.log("Processing channel ID:", channelId);

    if (!channelId) {
      return new Response(
        JSON.stringify({ error: "Channel ID is required" }),
        {
          status: 400,
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

    console.log("Making YouTube API request");
    const response = await fetch(apiUrl);
    console.log("YouTube API response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("YouTube API error response:", errorData);

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
    
    let data;
    try {
      data = await response.json();
      console.log("YouTube API response data:", JSON.stringify(data, null, 2));
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

      const channelResult = await channelResponse.json();
      console.log("Channel details response:", JSON.stringify(channelResult, null, 2));
      channelData = channelResult.items?.[0];
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
    console.error("Unexpected error in fetch-youtube-channel function:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred while fetching the channel",
        details: error.message,
        stack: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
