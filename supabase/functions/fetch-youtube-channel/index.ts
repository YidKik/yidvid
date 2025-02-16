
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders
    });
  }

  try {
    const { channelId } = await req.json();
    console.log("Received request to fetch channel:", channelId);

    if (!channelId) {
      throw new Error("Channel ID is required");
    }

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      console.error("YouTube API key not configured");
      throw new Error("YouTube API key not configured");
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
    const data = await response.json();

    if (!response.ok) {
      console.error("YouTube API error response:", data);
      throw new Error(`YouTube API error: ${data.error?.message || 'Unknown error'}`);
    }

    let channelData;
    if (cleanChannelId.startsWith('UC')) {
      channelData = data.items[0];
    } else {
      // If we searched by username, we need to get the first result's channel ID
      if (!data.items || data.items.length === 0) {
        console.error("No channel found for query:", cleanChannelId);
        throw new Error("Channel not found");
      }
      
      console.log("Found channel in search results, fetching details");
      const foundChannelId = data.items[0].snippet.channelId;
      
      // Now fetch the actual channel data
      const channelResponse = await fetch(
        `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=${foundChannelId}&key=${YOUTUBE_API_KEY}`
      );
      const channelResult = await channelResponse.json();
      
      if (!channelResponse.ok) {
        console.error("Error fetching channel details:", channelResult);
        throw new Error(`Error fetching channel details: ${channelResult.error?.message || 'Unknown error'}`);
      }
      
      channelData = channelResult.items[0];
    }

    if (!channelData) {
      console.error("No channel data found");
      throw new Error("Channel not found");
    }

    console.log("Successfully fetched channel data for:", channelData.snippet.title);
    
    const result = {
      channelId: channelData.id,
      title: channelData.snippet.title,
      description: channelData.snippet.description,
      thumbnailUrl: channelData.snippet.thumbnails.default.url,
      default_category: 'other'
    };

    return new Response(JSON.stringify(result), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200,
    });

  } catch (error) {
    console.error("Error in fetch-youtube-channel function:", error.message);
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred while fetching the channel',
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: error.status || 500,
      }
    );
  }
});
