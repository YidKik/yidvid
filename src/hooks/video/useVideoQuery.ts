
import { useQuery } from "@tanstack/react-query";
import { useState, useCallback, useEffect } from "react";
import { VideoData } from "./types/video-fetcher";
import { hasRealVideos } from "./utils/validation";

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
  const [isRecovering, setIsRecovering] = useState(false);

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
      }, 1000);
      
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
