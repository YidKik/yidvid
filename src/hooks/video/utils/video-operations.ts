
import { clearApplicationCache } from "@/lib/query-client";
import { 
  fetchVideosFromDatabase, 
  fetchActiveChannels, 
  formatVideoData 
} from "./database";
import { tryFetchNewVideos } from "./youtube-fetch";
import { performDirectDatabaseQuery } from "./direct-queries";
import { createSampleVideoData } from "./cache-manager";

/**
 * Core function to fetch all videos with fallback strategies
 */
export const fetchAllVideosOperation = async (
  fetchAttempts: number,
  setFetchAttempts: (value: number | ((prev: number) => number)) => void,
  setLastSuccessfulFetch: (value: Date | null) => void
): Promise<any[]> => {
  console.log("Starting video fetch process with highest priority...");
  
  // If we've had multiple failed attempts, clear cache before trying again
  // But limit the frequency of cache clearing to prevent loops
  if (fetchAttempts > 2) {
    const lastCacheClear = localStorage.getItem('lastOperationCacheClear');
    const now = new Date().getTime();
    
    // Only clear if it's been at least 2 minutes since last clear
    if (!lastCacheClear || (now - parseInt(lastCacheClear) > 2 * 60 * 1000)) {
      console.log(`${fetchAttempts} fetch attempts detected, clearing cache before new attempt...`);
      await clearApplicationCache();
      localStorage.setItem('lastOperationCacheClear', now.toString());
    } else {
      console.log(`Skipping cache clear despite ${fetchAttempts} attempts due to recent clear`);
    }
  }
  
  try {
    // First try direct database query with anon key
    let videosData: any[] = await performDirectDatabaseQuery();
    
    // If direct query failed, try fetchVideosFromDatabase with additional fallbacks
    if (videosData.length === 0) {
      try {
        videosData = await fetchVideosFromDatabase();
        
        // If we already have videos, set successful fetch even if the next part fails
        if (videosData.length > 0) {
          setLastSuccessfulFetch(new Date());
          console.log(`Successfully fetched ${videosData.length} videos from database`);
        } else {
          console.warn("No videos found in database, will try to fetch new ones with high priority");
        }
      } catch (error) {
        console.error("Error fetching videos from database:", error);
        // Continue to fetch with edge function
      }
    }

    // Try to get active channels, but don't fail the whole operation if this fails
    let channelIds: string[] = [];
    try {
      const channels = await fetchActiveChannels();
      channelIds = channels?.map(c => c.channel_id) || [];
      console.log(`Found ${channelIds.length} channels to process with high priority`);
    } catch (error) {
      console.error("Error fetching channels:", error);
      // Continue with what we have
    }

    // Only try to fetch new videos if we have channels and it's been at least 5 minutes since last attempt
    if (channelIds.length > 0) {
      const lastYoutubeAttempt = localStorage.getItem('lastYoutubeApiAttempt');
      const now = new Date().getTime();
      
      // Limit YouTube API calls to prevent quota issues and feedback loops
      if (!lastYoutubeAttempt || (now - parseInt(lastYoutubeAttempt) > 5 * 60 * 1000)) {
        try {
          localStorage.setItem('lastYoutubeApiAttempt', now.toString());
          
          const updatedVideos = await tryFetchNewVideos(
            channelIds,
            videosData,
            fetchAttempts,
            setFetchAttempts,
            setLastSuccessfulFetch,
            true // High priority flag
          );
          
          if (updatedVideos && updatedVideos.length > 0) {
            videosData = updatedVideos;
            console.log(`Updated videos with fresh data, now have ${videosData.length} videos`);
          }
        } catch (error) {
          console.error("Error in tryFetchNewVideos:", error);
          // Continue with what we have
        }
      } else {
        console.log("Skipping YouTube API call due to rate limiting");
      }
    }

    // If we still have no videos, only then create sample data as fallback
    if (videosData.length === 0) {
      console.warn("No videos found, creating fallback sample data");
      videosData = createSampleVideoData();
    }

    // Log success and increase fetch attempt counter
    setFetchAttempts(prev => prev + 1);
    
    // Return the data we got
    return formatVideoData(videosData);
  } catch (error: any) {
    console.error("Error in video fetching process:", error);
    // For any errors, increase the fetch attempts counter
    setFetchAttempts(prev => prev + 1);
    
    // Create and return fallback data only if we have no real data
    return formatVideoData(createSampleVideoData());
  }
};

/**
 * Force refreshes all videos by clearing cache first
 */
export const forceRefetchOperation = async (
  fetchAllVideosFunc: () => Promise<any[]>,
  setFetchAttempts: (value: number | ((prev: number) => number)) => void
): Promise<any[]> => {
  console.log("Forcing complete refresh of all videos...");
  
  // Add rate limiting to prevent excessive operations
  const lastForceOperation = localStorage.getItem('lastForceOperation');
  const now = new Date().getTime();
  
  // Only allow force refresh once per minute at most
  if (lastForceOperation && (now - parseInt(lastForceOperation) < 60 * 1000)) {
    console.log("Force operation skipped - too frequent");
    return [];
  }
  
  // Record this operation
  localStorage.setItem('lastForceOperation', now.toString());
  
  // Clear cache before force refresh to ensure freshest possible data
  await clearApplicationCache();
  setFetchAttempts(prev => prev + 1);
  return fetchAllVideosFunc();
};
