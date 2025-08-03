
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
    const { 
      channels = [], 
      forceUpdate = false, 
      quotaConservative = false, 
      prioritizeRecent = true, 
      maxChannelsPerRun = 20,
      bypassQuotaCheck = false,
      singleChannelMode = false  // Flag to handle individual channel operations
    } = await req.json();
    
    console.log(`Received request to fetch videos for ${channels.length} channels with forceUpdate=${forceUpdate} and singleChannelMode=${singleChannelMode}`);
    
    // Get primary API key from environment variables
    const primaryApiKey = Deno.env.get("YOUTUBE_API_KEY") || "";
    // Use environment variable for fallback API key
    const fallbackApiKey = Deno.env.get('YOUTUBE_FALLBACK_API_KEY') || "";
    
    // Check if we have quota remaining before starting
    const { quota_remaining, quota_reset_at } = bypassQuotaCheck ? 
      { quota_remaining: 10000, quota_reset_at: new Date().toISOString() } : 
      await checkQuota();
    
    if (quota_remaining <= 0 && !bypassQuotaCheck) {
      console.log(`YouTube API quota exceeded. Trying fallback key for this request.`);
      // We will use the fallback key instead of immediately failing
    }

    // If no channels provided, return early
    if (!channels || channels.length === 0) {
      console.log("No channels provided in the request");
      return new Response(
        JSON.stringify({
          success: false,
          message: "No channels provided to process"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For individual channel fetches or when bypassing quota check, we'll process all channels
    const channelsToProcess = bypassQuotaCheck || singleChannelMode ? 
      channels.length : 
      Math.min(
        Math.max(3, Math.floor(quota_remaining / 10)), // Ensure we can process at least 3 channels
        maxChannelsPerRun,
        channels.length
      );

    console.log(`Processing ${channelsToProcess} channels out of ${channels.length} requested`);
    
    // Only process the number of channels we can handle
    const channelsSubset = channels.slice(0, channelsToProcess);
    
    // Process channels in parallel with concurrency limit
    const results = [];
    let newVideosCount = 0;
    let processedCount = 0;
    let quotaUsed = 0;

    console.log("Starting to process channels");

    // Process channels sequentially to better manage quota
    for (const channelId of channelsSubset) {
      try {
        console.log(`Processing channel ${channelId}`);
        
        // Use primary API key first, fallback if needed
        const apiKey = ((quota_remaining <= 0) && !bypassQuotaCheck) ? fallbackApiKey : primaryApiKey;
        
        // Fetch channel videos directly from YouTube
        const { videos, quotaExceeded } = await fetchChannelVideos(channelId, apiKey);
        
        if (quotaExceeded && apiKey === primaryApiKey) {
          // Try again with fallback key if primary key quota is exceeded
          console.log("Primary API key quota exceeded, trying with fallback key");
          const fallbackResult = await fetchChannelVideos(channelId, fallbackApiKey);
          
          if (fallbackResult.videos.length > 0) {
            // Process videos from fallback result
            const fallbackProcessResult = await processChannel(channelId, fallbackResult.videos);
            processedCount++;
            newVideosCount += fallbackProcessResult.newVideos || 0;
            
            results.push({
              channelId,
              success: true,
              newVideos: fallbackProcessResult.newVideos,
              totalVideos: fallbackResult.videos.length,
              usedFallbackKey: true
            });
            
            continue;
          } else if (fallbackResult.quotaExceeded) {
            console.log("Both API keys have exceeded quota");
            break;
          }
        }
        
        // Track quota usage - each video request uses about 1 unit
        quotaUsed += videos.length > 0 ? (1 + Math.ceil(videos.length / 50)) : 1;
        
        console.log(`Found ${videos.length} videos for channel ${channelId}`);
        
        if (!videos || videos.length === 0) {
          results.push({
            channelId,
            success: false,
            newVideos: 0,
            message: "No videos found or channel not found"
          });
          continue;
        }
        
        // Process and store the videos
        const processResult = await processChannel(channelId, videos);
        
        processedCount++;
        newVideosCount += processResult.newVideos || 0;
        
        console.log(`Successfully added ${processResult.newVideos} new videos for channel ${channelId}`);
        
        results.push({
          channelId,
          success: true,
          newVideos: processResult.newVideos,
          totalVideos: videos.length,
          usedFallbackKey: apiKey === fallbackApiKey
        });
      } catch (error) {
        console.error(`Error processing channel ${channelId}:`, error);
        
        results.push({
          channelId,
          success: false,
          message: error.message
        });

        // If it's a quota error, try fallback key for next channels
        if (error.message.includes('quota') && primaryApiKey !== fallbackApiKey) {
          console.log("Switching to fallback API key after quota error");
        } else if (error.message.includes('quota')) {
          break; // If both keys have quota issues, stop processing
        }
        
        // Add shorter delay even after error to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Only update quota usage for the primary API key (not the fallback)
    if (quota_remaining > 0 && !bypassQuotaCheck) {
      await updateQuotaUsage(quotaUsed);
    }

    console.log(`Completed processing ${processedCount} channels, found ${newVideosCount} new videos`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        newVideos: newVideosCount,
        results,
        quotaUsed,
        quotaRemaining: bypassQuotaCheck ? "bypass" : (quota_remaining - quotaUsed),
        usedFallbackKey: (quota_remaining <= 0 && !bypassQuotaCheck)
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
