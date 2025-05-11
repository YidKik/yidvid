
import { useQuery } from "@tanstack/react-query";
import { useState, useCallback, useEffect } from "react";
import { VideoData } from "./types/video-fetcher";

interface UseVideoQueryProps {
  fetchAllVideos: () => Promise<VideoData[]>;
  forceRefetch: () => Promise<any>;
  authState: string | null;
  checkNetwork: () => boolean;
}

/**
 * Hook handling React Query setup for videos with optimized performance
 */
export const useVideoQuery = ({
  fetchAllVideos,
  forceRefetch,
  authState,
  checkNetwork
}: UseVideoQueryProps) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);
  const [networkRetries, setNetworkRetries] = useState(0);

  // Force retry by incrementing counter
  const triggerRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  // Check network before attempting fetch
  const safeFetchAllVideos = async (): Promise<VideoData[]> => {
    try {
      // Check if we are online first
      if (!checkNetwork()) {
        console.log("Network appears offline, using cached data if available");
        // Return empty array, React Query will use cached data if available
        return [];
      }

      // Try normal fetch
      const videos = await fetchAllVideos();
      setNetworkRetries(0); // Reset retries on success
      return videos;
    } catch (error) {
      console.log(`Error fetching videos (attempt ${networkRetries + 1}):`, error);
      
      if (networkRetries < 2) {
        setNetworkRetries(prev => prev + 1);
        const waitTime = 1000 * (networkRetries + 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return safeFetchAllVideos();
      }
      
      console.error("Maximum network retries reached, using cache or sample data");
      throw error;
    }
  };

  // Set up React Query with optimized fetching strategy
  const { data, isLoading, isFetching, error, refetch } = useQuery<VideoData[]>({
    // Include authState in the query key to force refetch on auth state changes
    queryKey: ["youtube_videos", retryCount, authState], 
    queryFn: safeFetchAllVideos,
    refetchInterval: 10 * 60 * 1000, // Reduce refetch frequency to 10 minutes
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 30 * 60 * 1000, // Cache data for 30 minutes
    retry: (failureCount, error: any) => {
      // Don't retry quota errors
      if (error?.message?.includes('quota')) return false;
      
      // Don't retry RLS recursion errors
      if (error?.message?.includes('recursion') || 
          error?.message?.includes('policy')) {
        console.log("Not retrying RLS error:", error.message);
        setIsRecovering(true);
        return false;
      }

      // Only retry once for network errors
      if (error?.message?.includes('fetch') && failureCount >= 1) {
        console.log("Network appears unstable, switching to offline mode");
        return false;
      }
      
      return failureCount < 1;
    },
    refetchOnMount: true, // Ensure fresh data on mount
    refetchOnWindowFocus: false
  });

  // Add recovery logic for RLS errors
  useEffect(() => {
    if (isRecovering && !isFetching) {
      setIsRecovering(false);
      
      // Use a timeout to prevent immediate retry
      const recoveryTimer = setTimeout(() => {
        console.log("Attempting recovery...");
        handleForceRefetch().catch(err => {
          console.error("Recovery attempt failed:", err);
        });
      }, 2000);
      
      return () => clearTimeout(recoveryTimer);
    }
  }, [isRecovering, isFetching]);

  // Create a wrapper for forceRefetch with retry counter
  const handleForceRefetch = async () => {
    try {
      setRetryCount(prev => prev + 1);
      const freshData = await forceRefetch();
      return freshData;
    } catch (err) {
      console.error("Error in force refresh:", err);
      return [];
    }
  };

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    forceRefetch: handleForceRefetch,
    triggerRetry,
    isRecovering
  };
};
