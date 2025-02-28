
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { processChannel } from "./channel-processor.ts";
import { decrementQuota, getQuotaInfo, resetQuotaIfNeeded } from "./quota-manager.ts";
import { fetchChannelVideos } from "./youtube-api.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

// Set up CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface RequestBody {
  channels?: string[];
  forceUpdate?: boolean;
  fullScan?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    console.log("Starting fetch-youtube-videos function");
    
    // Reset quota if needed
    await resetQuotaIfNeeded();
    
    // Check quota first
    const quotaInfo = await getQuotaInfo();
    if (quotaInfo.quotaRemaining <= 0) {
      console.log("YouTube API quota exceeded. Current remaining:", quotaInfo.quotaRemaining);
      return new Response(
        JSON.stringify({
          success: false,
          message: "YouTube API quota exceeded",
          quota_reset_at: quotaInfo.quotaResetAt,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 429,
        }
      );
    }

    // Parse request body
    let requestBody: RequestBody = {};
    if (req.method === "POST") {
      requestBody = await req.json();
    }

    const channelIds = requestBody.channels || [];
    const forceUpdate = requestBody.forceUpdate || false;
    const fullScan = requestBody.fullScan || false;
    
    console.log(`Processing ${channelIds.length} channels, forceUpdate: ${forceUpdate}, fullScan: ${fullScan}`);

    let processedCount = 0;
    let newVideosCount = 0;
    const maxQuotaToUse = Math.min(quotaInfo.quotaRemaining, 5000); // Use at most 5000 quota points
    let quotaUsed = 0;
    
    // Process channels in batches to manage quota better
    const batchSize = 5;
    for (let i = 0; i < channelIds.length; i += batchSize) {
      const batch = channelIds.slice(i, i + batchSize);
      const batchPromises = batch.map(async (channelId) => {
        try {
          console.log(`Processing channel: ${channelId}`);
          
          // For fullScan we use a longer lookback period to catch missed videos
          let maxResults = fullScan ? 50 : 10;
          let publishedAfter = fullScan 
            ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago for full scan 
            : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago for regular updates
            
          const videos = await fetchChannelVideos(channelId, maxResults, publishedAfter.toISOString());
          
          // Decrement quota - each channel fetch costs 1 quota unit
          await decrementQuota(1);
          quotaUsed += 1;
          
          // Process videos for this channel
          const result = await processChannel(channelId, videos);
          
          processedCount++;
          newVideosCount += result.newVideos;
          
          return result;
        } catch (error) {
          console.error(`Error processing channel ${channelId}:`, error);
          return { success: false, error: error.message, channelId };
        }
      });
      
      // Wait for batch to complete
      await Promise.all(batchPromises);
      
      // Check if we're approaching quota limit
      if (quotaUsed >= maxQuotaToUse) {
        console.log(`Stopping early: used ${quotaUsed} of ${maxQuotaToUse} allocated quota`);
        break;
      }
    }

    // Update quota tracking in DB
    await supabase
      .from("video_fetch_logs")
      .insert({
        videos_found: newVideosCount,
        channels_processed: processedCount,
        quota_remaining: quotaInfo.quotaRemaining - quotaUsed,
      });

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        newVideos: newVideosCount,
        quotaRemaining: quotaInfo.quotaRemaining - quotaUsed,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in fetch-youtube-videos:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
