
import { useQuery } from "@tanstack/react-query";
import { useState, useCallback, useEffect } from "react";
import { VideoData } from "./types/video-fetcher";
import { hasRealVideos } from "./utils/validation";

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
      
      // Limit network retries to prevent infinite loops
      if (networkRetries < 3) {
        setNetworkRetries(prev => prev + 1);
        
        // Wait a bit longer for each retry
        const waitTime = 1000 * (networkRetries + 1);
        console.log(`Will retry in ${waitTime}ms`);
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return safeFetchAllVideos();
      }
      
      // If we've retried too many times, throw the error to let React Query handle it
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
      
      // Don't retry RLS recursion errors - they need fixing at the DB level
      if (error?.message?.includes('recursion') || 
          error?.message?.includes('policy') || 
          error?.message?.includes('permission') ||
          error?.code === '42P07' ||
          error?.code === '42P17') { // Added specific RLS recursion error code
        console.log("Not retrying RLS error:", error.message);
        // Instead of retrying, we'll trigger a recovery process
        setIsRecovering(true);
        return false;
      }

      // Don't retry network errors after multiple failures
      if (error?.message?.includes('fetch') && failureCount >= 2) {
        console.log("Network appears unstable, switching to offline mode");
        return false;
      }
      
      // Only retry once for other errors
      return failureCount < 1;
    },
    refetchOnMount: true, // Always ensure fresh data on mount
    refetchOnWindowFocus: false
  });

  // Add recovery logic for RLS errors
  useEffect(() => {
    if (isRecovering && !isFetching) {
      setIsRecovering(false);
      
      // Use a timeout to prevent immediate retry
      const recoveryTimer = setTimeout(() => {
        console.log("Attempting recovery via edge function...");
        handleForceRefetch().catch(err => {
          console.error("Recovery attempt failed:", err);
        });
      }, 2000);
      
      return () => clearTimeout(recoveryTimer);
    }
  }, [isRecovering, isFetching]);

  // Add network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log("Network connection restored");
      // Don't refetch immediately to avoid overwhelming the network
      setTimeout(() => {
        if (checkNetwork()) refetch();
      }, 2000);
    };

    // Add event listeners for online/offline status
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [refetch, checkNetwork]);

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
