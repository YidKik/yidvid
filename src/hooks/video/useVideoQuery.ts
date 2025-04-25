
import { useQuery } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { VideoData } from "./types/video-fetcher";

interface UseVideoQueryProps {
  fetchAllVideos: () => Promise<VideoData[]>;
  forceRefetch: () => Promise<any>;
  authState: string | null;
}

/**
 * Hook handling React Query setup for videos with optimized performance
 */
export const useVideoQuery = ({
  fetchAllVideos,
  forceRefetch,
  authState
}: UseVideoQueryProps) => {
  const [retryCount, setRetryCount] = useState(0);

  // Force retry by incrementing counter
  const triggerRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  // Set up React Query with optimized fetching strategy
  const { data, isLoading, isFetching, error, refetch } = useQuery<VideoData[]>({
    // Include authState in the query key to force refetch on auth state changes
    queryKey: ["youtube_videos", retryCount, authState], 
    queryFn: fetchAllVideos,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    gcTime: 30 * 60 * 1000, // Cache data for 30 minutes
    retry: 1,
    retryDelay: 300, // Fast retry for better UX
    meta: {
      errorMessage: "Failed to load videos",
      suppressToasts: true // Don't show error toasts to avoid overwhelming users
    },
    // Always refetch on mount to ensure fresh data with correct permissions
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

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
    triggerRetry
  };
};
