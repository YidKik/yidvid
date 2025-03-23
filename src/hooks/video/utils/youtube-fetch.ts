
import { supabase } from "@/integrations/supabase/client";
import { checkApiQuota } from "../useApiQuota";
import { fetchUpdatedVideosAfterSync } from "./database";

/**
 * Call edge function to fetch new videos
 */
export const fetchNewVideosFromEdgeFunction = async (
  channelIds: string[], 
  fetchAttempts: number,
  setFetchAttempts: (value: number | ((prev: number) => number)) => void,
  setLastSuccessfulFetch: (value: Date | null) => void,
  highPriority: boolean = false
): Promise<{ success: boolean; message?: string }> => {
  try {
    console.log(`Calling edge function to fetch new videos with ${highPriority ? 'HIGH' : 'normal'} priority...`);
    
    // Catch edge function connection errors
    try {
      const { data: response, error: fetchError } = await supabase.functions.invoke('fetch-youtube-videos', {
        body: { 
          channels: channelIds,
          forceUpdate: fetchAttempts > 1 || highPriority, // Force update if attempts > 1 or high priority
          quotaConservative: !highPriority, // Don't be conservative with quota if high priority
          prioritizeRecent: true, // Always prioritize recently active channels
          maxChannelsPerRun: highPriority ? 10 : 5 // Process more channels if high priority
        }
      });

      if (fetchError) {
        console.error('Error invoking fetch-youtube-videos:', fetchError);
        setFetchAttempts(prev => prev + 1);
        return { success: false, message: fetchError.message };
      }
      
      console.log('Fetch response:', response);
      
      if (response?.success) {
        console.log(`Successfully processed ${response.processed} channels, found ${response.newVideos} new videos`);
        setFetchAttempts(0);
        setLastSuccessfulFetch(new Date());
        
        if (response.newVideos > 0) {
          console.log(`Found ${response.newVideos} new videos`);
          // Removed toast notification
        } else {
          console.log("No new videos found");
        }
        
        return { success: true };
      } else if (response?.quota_reset_at) {
        const resetTime = new Date(response.quota_reset_at);
        const message = `YouTube quota limited. Full service will resume at ${resetTime.toLocaleString()}`;
        console.log(message);
        return { success: false, message };
      } else if (response?.message) {
        console.error(response.message);
        return { success: false, message: response.message };
      }
    } catch (edgeError) {
      console.error("Edge function connection error:", edgeError);
      return { success: false, message: "Connection error with video service" };
    }
    
    return { success: false, message: "Unknown error fetching videos" };
  } catch (error) {
    console.error("Error in fetchNewVideosFromEdgeFunction:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Try to fetch new videos if quota allows
 */
export const tryFetchNewVideos = async (
  channelIds: string[], 
  existingData: any[],
  fetchAttempts: number,
  setFetchAttempts: (value: number | ((prev: number) => number)) => void,
  setLastSuccessfulFetch: (value: Date | null) => void,
  highPriority: boolean = false
): Promise<any[]> => {
  try {
    console.log(`Trying to fetch new videos with ${highPriority ? 'HIGH' : 'normal'} priority...`);
    
    let quotaInfo = null;
    try {
      quotaInfo = await checkApiQuota();
      console.log("Current quota status:", quotaInfo);
    } catch (error) {
      console.warn("Could not check quota:", error);
      // Continue anyway, but with caution
    }
    
    // Be more aggressive with quota if high priority, otherwise be conservative
    const minQuotaRequired = highPriority ? 500 : 1000;
    
    // Only proceed if we have sufficient quota remaining or if we couldn't check quota
    if (quotaInfo === null || quotaInfo.quota_remaining >= minQuotaRequired || highPriority) {
      // Call edge function to fetch new videos
      const result = await fetchNewVideosFromEdgeFunction(
        channelIds, 
        fetchAttempts,
        setFetchAttempts,
        setLastSuccessfulFetch,
        highPriority
      );
      
      if (result.success) {
        console.log("Successfully fetched new videos, updating data...");
        // Refetch videos after successful update
        try {
          const updatedVideos = await fetchUpdatedVideosAfterSync();
          return updatedVideos;
        } catch (error) {
          console.error("Error fetching updated videos:", error);
          return existingData;
        }
      } else {
        console.warn("Failed to fetch new videos:", result.message);
      }
    } else {
      console.log('Using cached video data due to quota limitations');
    }
    
    return existingData;
  } catch (error) {
    console.error("Error fetching new videos:", error);
    setFetchAttempts(prev => prev + 1);
    return existingData;
  }
};
