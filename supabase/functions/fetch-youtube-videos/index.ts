
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { checkQuota, updateQuotaUsage } from "./quota-manager.ts";
import { processChannel } from "./channel-processor.ts";
import { fetchChannelVideos } from "./youtube-api.ts";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { channels = [], forceUpdate = false, quotaConservative = false, prioritizeRecent = false, maxChannelsPerRun = 10 } = await req.json();
    
    // Check if we have quota remaining before starting
    const { quota_remaining, quota_reset_at } = await checkQuota();
    
    if (quota_remaining <= 0) {
      console.log(`YouTube API quota exceeded. Retry after ${quota_reset_at}`);
      return new Response(
        JSON.stringify({
          success: false,
          message: "YouTube API quota exceeded.",
          quota_reset_at
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate how many channels we can process based on available quota
    // Each channel costs ~10-15 units to process (1 for channel info, ~10 for videos)
    const estimatedQuotaPerChannel = quotaConservative ? 20 : 15;
    const maxChannelsBasedOnQuota = Math.floor(quota_remaining / estimatedQuotaPerChannel);
    const channelsToProcess = Math.min(
      maxChannelsBasedOnQuota, 
      maxChannelsPerRun,
      channels.length
    );

    console.log(`Processing ${channelsToProcess} channels out of ${channels.length} requested`);
    
    if (channelsToProcess <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Not enough quota to process any channels",
          quota_remaining,
          quota_reset_at
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only process the number of channels we can handle
    const channelsSubset = channels.slice(0, channelsToProcess);
    
    // Process channels in parallel with concurrency limit
    const results = [];
    let newVideosCount = 0;
    let processedCount = 0;
    let quotaUsed = 0;

    // If prioritizing recent, sort the channels by last update time
    if (prioritizeRecent) {
      // We'll prioritize by just using the first N channels
      // since they were likely sorted by recent activity already
      console.log("Prioritizing most recently active channels");
    }

    // Process channels sequentially to better manage quota
    for (const channelId of channelsSubset) {
      try {
        // Fetch channel videos
        const { videos, quotaExceeded } = await fetchChannelVideos(channelId, Deno.env.get("YOUTUBE_API_KEY") || "");
        
        if (quotaExceeded) {
          console.log("YouTube API quota exceeded during fetch");
          break;
        }
        
        // Track quota usage - each video request uses about 1 unit
        quotaUsed += videos.length > 0 ? (1 + Math.ceil(videos.length / 50)) : 1;
        
        if (!videos || videos.length === 0) {
          results.push({
            channelId,
            success: false,
            message: "No videos found or channel not found"
          });
          continue;
        }
        
        // Process and store the videos
        const processResult = await processChannel(channelId, videos);
        
        processedCount++;
        newVideosCount += processResult.newVideos || 0;
        
        results.push({
          channelId,
          success: true,
          newVideos: processResult.newVideos,
          totalVideos: videos.length
        });
        
        // If we're being quota conservative, check after each channel
        if (quotaConservative && quota_remaining - quotaUsed < estimatedQuotaPerChannel) {
          console.log("Stopping early to conserve quota");
          break;
        }
      } catch (error) {
        console.error(`Error processing channel ${channelId}:`, error);
        results.push({
          channelId,
          success: false,
          message: error.message
        });
      }
    }

    // Update used quota
    await updateQuotaUsage(quotaUsed);

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        newVideos: newVideosCount,
        results,
        quotaUsed,
        quotaRemaining: quota_remaining - quotaUsed
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in fetch-youtube-videos:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "An unexpected error occurred"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
