
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

  // Effect to check cache freshness periodically
  useEffect(() => {
    // Check cache freshness on mount
    checkAndClearStaleCache(lastCacheCheck, lastSuccessfulFetch, setLastCacheCheck);
    
    // Set up periodic check (every 30 minutes)
    const intervalId = setInterval(() => {
      checkAndClearStaleCache(lastCacheCheck, lastSuccessfulFetch, setLastCacheCheck);
    }, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [lastCacheCheck, lastSuccessfulFetch]);

  // Memoize fetchAllVideos to avoid recreating on each render
  const fetchAllVideos = useCallback(async (): Promise<VideoData[]> => {
    return fetchAllVideosOperation(
      fetchAttempts, 
      setFetchAttempts, 
      setLastSuccessfulFetch
    );
  }, [fetchAttempts]);

  // Memoize forceRefetch to avoid recreating on each render
  const forceRefetch = useCallback(async (): Promise<VideoData[]> => {
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
