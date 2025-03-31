
import { useState, useEffect, useCallback } from "react";
import { VideoData, VideoFetcherResult } from "./types/video-fetcher";
import { checkAndClearStaleCache, shouldFetchNewVideos } from "./utils/cache-manager";
import { fetchAllVideosOperation, forceRefetchOperation } from "./utils/video-operations";

/**
 * Hook with functionality to fetch all videos from the database
 * and trigger edge function for fetching new videos
 */
export const useVideoFetcher = (): VideoFetcherResult => {
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState<Date | null>(null);
  const [lastCacheCheck, setLastCacheCheck] = useState<Date | null>(null);

  // Effect to check cache freshness periodically, but with rate limiting
  useEffect(() => {
    // Get the timestamp of when we last cleared the cache
    const lastCacheClearTime = localStorage.getItem('lastCacheClearTime');
    const now = new Date().getTime();
    
    // Only check cache if it hasn't been cleared in the last 10 minutes
    if (!lastCacheClearTime || (now - parseInt(lastCacheClearTime)) > 10 * 60 * 1000) {
      // Check cache freshness on mount
      checkAndClearStaleCache(lastCacheCheck, lastSuccessfulFetch, setLastCacheCheck);
      
      // Record this cache check
      localStorage.setItem('lastCacheClearTime', now.toString());
    } else {
      console.log("Skipping cache check due to recent clear");
    }
    
    // Set up periodic check (every 30 minutes) with rate limiting
    const intervalId = setInterval(() => {
      const currentTime = new Date().getTime();
      const lastClear = localStorage.getItem('lastCacheClearTime');
      
      // Only perform cache check if it's been at least 30 minutes since last clear
      if (!lastClear || (currentTime - parseInt(lastClear)) > 30 * 60 * 1000) {
        checkAndClearStaleCache(lastCacheCheck, lastSuccessfulFetch, setLastCacheCheck);
        localStorage.setItem('lastCacheClearTime', currentTime.toString());
      }
    }, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [lastCacheCheck, lastSuccessfulFetch]);

  // Reset excessive fetch attempts counter
  useEffect(() => {
    // If we somehow have an extremely high fetch attempt count, reset it
    // This prevents the infinite loop of fetch attempts
    if (fetchAttempts > 20) {
      console.log("Resetting excessive fetch attempts counter");
      setFetchAttempts(0);
      
      // Record this in localStorage to prevent immediate resets
      localStorage.setItem('fetchAttemptsReset', new Date().getTime().toString());
    }
  }, [fetchAttempts]);

  // Memoize fetchAllVideos to avoid recreating on each render
  const fetchAllVideos = useCallback(async (): Promise<VideoData[]> => {
    // Check if we've reset attempts recently to prevent feedback loops
    const lastReset = localStorage.getItem('fetchAttemptsReset');
    const now = new Date().getTime();
    
    // If we reset recently and still have high attempts, just return empty to break the cycle
    if (lastReset && (now - parseInt(lastReset) < 5 * 60 * 1000) && fetchAttempts > 10) {
      console.log("Breaking fetch cycle due to recent reset and still high attempt count");
      return [];
    }
    
    // Use a modified fetchAttempts that caps at 10 to prevent excessive resource usage
    const limitedAttempts = Math.min(fetchAttempts, 10);
    
    return fetchAllVideosOperation(
      limitedAttempts, 
      setFetchAttempts, 
      setLastSuccessfulFetch
    );
  }, [fetchAttempts]);

  // Memoize forceRefetch to avoid recreating on each render
  const forceRefetch = useCallback(async (): Promise<VideoData[]> => {
    // Add rate limiting for force refreshes
    const lastForceRefresh = localStorage.getItem('lastForceRefresh');
    const now = new Date().getTime();
    
    if (lastForceRefresh && (now - parseInt(lastForceRefresh) < 60 * 1000)) {
      console.log("Force refresh limited - last refresh was less than 1 minute ago");
      return [];
    }
    
    // Record this force refresh
    localStorage.setItem('lastForceRefresh', now.toString());
    
    return forceRefetchOperation(fetchAllVideos, setFetchAttempts);
  }, [fetchAllVideos]);

  return {
    fetchAllVideos,
    forceRefetch,
    fetchAttempts,
    lastSuccessfulFetch,
    setFetchAttempts,
    setLastSuccessfulFetch
  };
};

// Re-export VideoData type for convenience
export type { VideoData } from "./types/video-fetcher";
