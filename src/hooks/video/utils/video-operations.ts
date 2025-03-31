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
    // First try direct database query
    let videosData: any[] = await performDirectDatabaseQuery();
    
    // If direct query returned data, we're good
    if (videosData.length > 0) {
      setLastSuccessfulFetch(new Date());
      console.log(`Successfully fetched ${videosData.length} videos from direct query`);
      return formatVideoData(videosData);
    }
    
    // Otherwise try regular database fetch
    try {
      videosData = await fetchVideosFromDatabase();
      
      // If we got videos, set successful fetch
      if (videosData.length > 0) {
        setLastSuccessfulFetch(new Date());
        console.log(`Successfully fetched ${videosData.length} videos from database`);
      } else {
        console.warn("No videos found in database, will try to fetch new ones");
      }
    } catch (error) {
      console.error("Error fetching videos from database:", error);
      // Continue to fetch with edge function
    }

    // Try to get active channels
    let channelIds: string[] = [];
    try {
      const channels = await fetchActiveChannels();
      channelIds = channels?.map(c => c.channel_id) || [];
    } catch (error) {
      console.error("Error fetching channels:", error);
      // Continue with what we have
    }

    // If we have channels and it's been at least 5 minutes since last attempt
    if (channelIds.length > 0) {
      const lastYoutubeAttempt = localStorage.getItem('lastYoutubeApiAttempt');
      const now = new Date().getTime();
      
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

    // If we have videos by now, return them
    if (videosData.length > 0) {
      // Increment fetch attempts counter for tracking
      setFetchAttempts(prev => prev + 1);
      return formatVideoData(videosData);
    }

    // If all else failed, create sample data as fallback
    console.warn("No videos found, creating fallback sample data");
    setFetchAttempts(prev => prev + 1);
    return formatVideoData(createSampleVideoData());
  } catch (error: any) {
    console.error("Error in video fetching process:", error);
    setFetchAttempts(prev => prev + 1);
    
    // Last resort - return sample data
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
  
  try {
    // Clear cache before force refresh
    await clearApplicationCache();
    setFetchAttempts(prev => prev + 1);
    return fetchAllVideosFunc();
  } catch (error) {
    console.error("Error in force refresh:", error);
    return [];
  }
};
