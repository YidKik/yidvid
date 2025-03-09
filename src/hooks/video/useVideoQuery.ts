
import { useQuery } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { VideoData } from "./types/video-fetcher";
import { hasRealVideos } from "./utils/validation";

interface UseVideoQueryProps {
  fetchAllVideos: () => Promise<VideoData[]>;
  forceRefetch: () => Promise<any>;
  authState: string | null;
}

/**
 * Hook handling React Query setup for videos
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

  // Set up React Query with aggressive refetching strategy
  const { data, isLoading, isFetching, error, refetch } = useQuery<VideoData[]>({
    // Include authState in the query key to force refetch on auth state changes
    queryKey: ["youtube_videos", retryCount, authState], 
    queryFn: fetchAllVideos,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 1 * 60 * 1000, // Consider data stale after 1 minute
    gcTime: 30 * 60 * 1000, // Cache data for 30 minutes
    retry: (failureCount, error: any) => {
      // Don't retry quota errors
      if (error?.message?.includes('quota')) return false;
      // Don't retry permissions errors from Row Level Security
      if (error?.message?.includes('recursion') || 
          error?.message?.includes('policy') || 
          error?.message?.includes('permission')) {
        console.log("Not retrying RLS/permission error");
        return false;
      }
      // Retry network errors up to 3 times (reduced from 5)
      if (error?.message?.includes('network') || error?.message?.includes('fetch')) return failureCount < 3;
      // Only retry once for other errors (reduced from 3)
      return failureCount < 2;
    },
    retryDelay: 500, // Reduced from 1000ms to 500ms
    meta: {
      errorMessage: "Failed to load videos",
      suppressToasts: true // Don't show error toasts
    },
    // Always fetch fresh data on mount only if we don't have real data
    refetchOnMount: (query) => {
      const existingData = query.state.data as VideoData[] | undefined;
      // Only refetch if we don't have real videos
      return !hasRealVideos(existingData);
    },
    refetchOnWindowFocus: false // Don't refetch on window focus
  });

  // Create a wrapper for forceRefetch with retry counter
  const handleForceRefetch = async () => {
    try {
      // Silently force refresh without showing toast about forcing refresh
      setRetryCount(prev => prev + 1);
      const freshData = await forceRefetch();
      console.log(`Force refetch completed, got ${freshData.length} videos`);
      return freshData;
    } catch (err) {
      console.error("Error in force refetch:", err);
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
