
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { checkQuota, updateQuotaUsage } from "./quota-manager.ts";
import { processChannel } from "./channel-processor.ts";
import { fetchChannelVideos } from "./youtube-api.ts";
import { logFetchAttempt } from "./logger.ts";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Check content type and method
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers.get('content-type'));
    
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log('Raw request text length:', bodyText.length);
      console.log('Raw request text:', bodyText.substring(0, 200));
      
      if (!bodyText || bodyText.trim() === '') {
        console.error('Empty request body received');
        requestBody = {};
      } else {
        requestBody = JSON.parse(bodyText);
        console.log('Successfully parsed body with', requestBody.channels?.length || 0, 'channels');
      }
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      console.error('Body text that failed to parse:', bodyText.substring(0, 100));
      requestBody = {};
    }
    
    console.log('Parsed request body:', JSON.stringify(requestBody, null, 2));
    
    // Support both "channels" and legacy "channelIds" keys
    const channels: string[] = Array.isArray(requestBody.channels)
      ? requestBody.channels
      : (Array.isArray(requestBody.channelIds) ? requestBody.channelIds : []);
    
    const {
      forceUpdate = false,
      quotaConservative = false,
      prioritizeRecent = true,
      maxChannelsPerRun = 20,
      bypassQuotaCheck = false,
      singleChannelMode = false,  // Flag to handle individual channel operations
      dailyAutoMode = false  // Flag for daily automatic fetch of all active channels
    } = requestBody;
    
    console.log(`Received request to fetch videos for ${channels.length} channels with forceUpdate=${forceUpdate}, singleChannelMode=${singleChannelMode}, dailyAutoMode=${dailyAutoMode}`);
    
    if (channels.length > 0) {
      console.log('First 5 channels:', channels.slice(0, 5));
    }
    
    // If dailyAutoMode is enabled and no channels provided, fetch all active channels from database
    let channelsToFetch = channels;
    if (dailyAutoMode && channels.length === 0) {
      console.log("Daily auto mode: Fetching all active channels from database...");
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Fetch all active channels that are not deleted and have no errors
      // Order by last_fetch to prioritize channels that haven't been updated recently
      const { data: activeChannels, error: channelError } = await supabase
        .from("youtube_channels")
        .select("channel_id, last_fetch, title")
        .is("deleted_at", null)
        .is("fetch_error", null)
        .order("last_fetch", { ascending: true, nullsFirst: true });
      
      if (channelError) {
        console.error("Error fetching active channels:", channelError);
        return new Response(
          JSON.stringify({
            success: false,
            message: "Failed to fetch active channels from database"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      channelsToFetch = activeChannels?.map(ch => ch.channel_id) || [];
      console.log(`Found ${channelsToFetch.length} active channels to process in daily auto mode`);
      
      if (channelsToFetch.length === 0) {
        console.log("No active channels found in database");
        return new Response(
          JSON.stringify({
            success: true,
            message: "No active channels found to process",
            processed: 0,
            newVideos: 0
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
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

    // If no channels provided and not in daily auto mode, return early
    if (!channelsToFetch || channelsToFetch.length === 0) {
      console.log("No channels provided in the request");
      return new Response(
        JSON.stringify({
          success: false,
          message: "No channels provided to process"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For daily auto mode, individual channel fetches, or when bypassing quota check, process all channels
    const channelsToProcess = dailyAutoMode || bypassQuotaCheck || singleChannelMode ? 
      channelsToFetch.length : 
      Math.min(
        Math.max(3, Math.floor(quota_remaining / 10)), // Ensure we can process at least 3 channels
        maxChannelsPerRun,
        channelsToFetch.length
      );

    console.log(`Processing ${channelsToProcess} channels out of ${channelsToFetch.length} requested`);
    
    // Only process the number of channels we can handle
    const channelsSubset = channelsToFetch.slice(0, channelsToProcess);
    
    // Process channels in parallel with concurrency limit
    const results = [];
    let newVideosCount = 0;
    let processedCount = 0;
    let quotaUsed = 0;

    console.log("Starting to process channels");

    // Process channels sequentially to better manage quota
    for (const channelId of channelsSubset) {
      try {
    console.log(`Processing channel ${channelId} (${processedCount + 1}/${channelsToProcess})`);
        
        // Use primary API key first, fallback if needed
        const apiKey = ((quota_remaining <= 0) && !bypassQuotaCheck) ? fallbackApiKey : primaryApiKey;
        
        // Fetch channel videos directly from YouTube
        const { videos, quotaExceeded } = await fetchChannelVideos(channelId, apiKey);
        console.log(`Channel ${channelId}: Found ${videos?.length || 0} videos, quotaExceeded: ${quotaExceeded}`);
        
        if (quotaExceeded && apiKey === primaryApiKey) {
          // Try again with fallback key if primary key quota is exceeded
          console.log("Primary API key quota exceeded, trying with fallback key");
          const fallbackResult = await fetchChannelVideos(channelId, fallbackApiKey);
          console.log(`Fallback attempt for ${channelId}: Found ${fallbackResult.videos?.length || 0} videos`);
          
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

    // Log the fetch attempt for debugging
    await logFetchAttempt(processedCount, newVideosCount, quota_remaining - quotaUsed);

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
    
    // Log the error
    await logFetchAttempt(0, 0, undefined, error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "An unexpected error occurred"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
