import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { testChannelId = "UCJ0-OtVpF0wOKEqT2Z1HEtA" } = await req.json();
    
    console.log("Testing YouTube API with channel:", testChannelId);
    
    const apiKey = Deno.env.get("YOUTUBE_API_KEY");
    const fallbackKey = Deno.env.get("YOUTUBE_FALLBACK_API_KEY");
    
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: "No YouTube API key configured",
        success: false
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    
    console.log("API keys available:", {
      primary: apiKey ? "Yes" : "No",
      fallback: fallbackKey ? "Yes" : "No"
    });
    
    // Test primary API key
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&id=${testChannelId}&key=${apiKey}`;
    console.log("Testing primary API key...");
    
    const response = await fetch(channelUrl);
    const responseText = await response.text();
    
    console.log("Primary API response status:", response.status);
    console.log("Primary API response:", responseText.substring(0, 500));
    
    let channelData;
    try {
      channelData = JSON.parse(responseText);
    } catch (e) {
      channelData = { error: "Failed to parse JSON", raw: responseText };
    }
    
    const result = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      channelId: testChannelId,
      apiKeyStatus: {
        primary: apiKey ? "Available" : "Missing",
        fallback: fallbackKey ? "Available" : "Missing"
      },
      channelData: channelData,
      hasUploadPlaylist: channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ? "Yes" : "No"
    };
    
    // If primary fails, test fallback
    if (!response.ok && fallbackKey) {
      console.log("Testing fallback API key...");
      const fallbackUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&id=${testChannelId}&key=${fallbackKey}`;
      const fallbackResponse = await fetch(fallbackUrl);
      const fallbackText = await fallbackResponse.text();
      
      console.log("Fallback API response status:", fallbackResponse.status);
      
      result.fallbackTest = {
        success: fallbackResponse.ok,
        status: fallbackResponse.status,
        statusText: fallbackResponse.statusText,
        response: fallbackText.substring(0, 500)
      };
    }
    
    return new Response(JSON.stringify(result, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Debug test error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});