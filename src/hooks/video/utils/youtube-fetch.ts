
import { supabase } from "@/integrations/supabase/client";
import { checkApiQuota } from "../useApiQuota";

/**
 * Call edge function to fetch new videos
 */
export const fetchNewVideosFromEdgeFunction = async (
  channelIds: string[], 
  fetchAttempts: number,
  setFetchAttempts: (value: number | ((prev: number) => number)) => void,
  setLastSuccessfulFetch: (value: Date | null) => void
): Promise<{ success: boolean }> => {
  try {
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
      return { success: false };
    }
    
    console.log('Fetch response:', response);
    
    if (response?.success) {
      console.log(`Successfully processed ${response.processed} channels, found ${response.newVideos} new videos`);
      setFetchAttempts(0);
      setLastSuccessfulFetch(new Date());
      return { success: true };
    } else if (response?.quota_reset_at) {
      const resetTime = new Date(response.quota_reset_at);
      console.log(`YouTube quota limited. Full service will resume at ${resetTime.toLocaleString()}`);
    }
    
    return { success: false };
  } catch (error) {
    console.error("Error in fetchNewVideosFromEdgeFunction:", error);
    return { success: false };
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
    let quotaInfo = null;
    try {
      quotaInfo = await checkApiQuota();
    } catch (error) {
      console.warn("Could not check quota:", error);
      // Continue anyway, but with caution
    }
    
    // Only proceed if we have at least 20% of daily quota remaining (2000 units)
    // or if we couldn't check quota (null)
    if (quotaInfo === null || quotaInfo.quota_remaining >= 2000) {
      // Call edge function to fetch new videos
      const result = await fetchNewVideosFromEdgeFunction(
        channelIds, 
        fetchAttempts,
        setFetchAttempts,
        setLastSuccessfulFetch
      );
      
      if (result.success) {
        // Refetch videos after successful update
        const updatedVideos = await import('./video-database').then(module => module.fetchUpdatedVideosAfterSync());
        return updatedVideos;
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
