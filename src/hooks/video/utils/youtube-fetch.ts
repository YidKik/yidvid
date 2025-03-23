
import { fetchUpdatedVideosAfterSync } from "./database";
import { invokeYouTubeEdgeFunction } from "./edge-function-client";
import { processYouTubeFetchResponse } from "./fetch-response-handler";
import { hasSufficientQuota } from "./quota-manager";

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
    
    // Configure request options based on priority and fetch attempts
    const options = {
      forceUpdate: fetchAttempts > 1 || highPriority,
      quotaConservative: !highPriority,
      prioritizeRecent: true,
      maxChannelsPerRun: highPriority ? 10 : 5
    };
    
    // Invoke the edge function
    const response = await invokeYouTubeEdgeFunction(channelIds, options);
    
    // Process the response
    if (!response) {
      console.error('No response from edge function');
      setFetchAttempts(prev => prev + 1);
      return { success: false, message: "No response from video service" };
    }
    
    return processYouTubeFetchResponse(response, setFetchAttempts, setLastSuccessfulFetch);
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
    
    // Check if we have sufficient quota
    const hasQuota = await hasSufficientQuota(highPriority);
    
    // Only proceed if we have sufficient quota
    if (hasQuota) {
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
