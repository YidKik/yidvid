
import { supabase } from "@/integrations/supabase/client";
import { checkApiQuota } from "../useApiQuota";
import { toast } from "sonner";

/**
 * Call edge function to fetch new videos
 */
export const fetchNewVideosFromEdgeFunction = async (
  channelIds: string[], 
  fetchAttempts: number,
  setFetchAttempts: (value: number | ((prev: number) => number)) => void,
  setLastSuccessfulFetch: (value: Date | null) => void
): Promise<{ success: boolean; message?: string }> => {
  try {
    console.log("Calling edge function to fetch new videos...");
    
    const { data: response, error: fetchError } = await supabase.functions.invoke('fetch-youtube-videos', {
      body: { 
        channels: channelIds,
        forceUpdate: fetchAttempts > 2, // Force update if we've had multiple attempts
        quotaConservative: true, // Flag to indicate conservative quota usage
        prioritizeRecent: true, // Flag to prioritize recently active channels
        maxChannelsPerRun: 5 // Limit the number of channels processed in a single run
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
        toast.success(`Found ${response.newVideos} new videos!`);
      } else {
        toast.info("You're up to date! No new videos found.");
      }
      
      return { success: true };
    } else if (response?.quota_reset_at) {
      const resetTime = new Date(response.quota_reset_at);
      const message = `YouTube quota limited. Full service will resume at ${resetTime.toLocaleString()}`;
      console.log(message);
      toast.warning(message);
      return { success: false, message };
    } else if (response?.message) {
      toast.error(response.message);
      return { success: false, message: response.message };
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
  setLastSuccessfulFetch: (value: Date | null) => void
): Promise<any[]> => {
  try {
    console.log("Trying to fetch new videos...");
    
    let quotaInfo = null;
    try {
      quotaInfo = await checkApiQuota();
      console.log("Current quota status:", quotaInfo);
    } catch (error) {
      console.warn("Could not check quota:", error);
      // Continue anyway, but with caution
    }
    
    // Only proceed if we have at least 10% of daily quota remaining (1000 units)
    // or if we couldn't check quota (null)
    if (quotaInfo === null || quotaInfo.quota_remaining >= 1000) {
      // Call edge function to fetch new videos
      const result = await fetchNewVideosFromEdgeFunction(
        channelIds, 
        fetchAttempts,
        setFetchAttempts,
        setLastSuccessfulFetch
      );
      
      if (result.success) {
        console.log("Successfully fetched new videos, updating data...");
        // Refetch videos after successful update
        try {
          const updatedVideos = await import('./video-database').then(module => module.fetchUpdatedVideosAfterSync());
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
      toast.warning('YouTube API quota limited. Using cached video data.');
    }
    
    return existingData;
  } catch (error) {
    console.error("Error fetching new videos:", error);
    setFetchAttempts(prev => prev + 1);
    return existingData;
  }
};
