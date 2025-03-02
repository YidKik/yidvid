
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useVideoRealtime } from "./useVideoRealtime";
import { useVideoFetcher, VideoData } from "./useVideoFetcher";
import { toast } from "sonner";

export interface UseVideosResult {
  data: VideoData[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
  forceRefetch: () => Promise<any>;
  lastSuccessfulFetch: Date | null;
  fetchAttempts: number;
}

export const useVideos = (): UseVideosResult => {
  const [retryCount, setRetryCount] = useState(0);
  
  // Set up real-time subscription for video changes
  useVideoRealtime();

  // Initialize the video fetcher with more reliable error handling
  const {
    fetchAllVideos,
    forceRefetch,
    fetchAttempts,
    lastSuccessfulFetch,
    setFetchAttempts
  } = useVideoFetcher();

  // Set up React Query with more aggressive refetching strategy
  const { data, isLoading, isFetching, error, refetch } = useQuery<VideoData[]>({
    queryKey: ["youtube_videos", retryCount], // Add retryCount to force refetch
    queryFn: fetchAllVideos,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes (more aggressive)
    staleTime: 1 * 60 * 1000, // Consider data stale after 1 minute (more aggressive)
    gcTime: 30 * 60 * 1000, // Cache data for 30 minutes
    retry: (failureCount, error: any) => {
      // Don't retry quota errors
      if (error?.message?.includes('quota')) return false;
      // Retry network errors up to 5 times (more retries)
      if (error?.message?.includes('network') || error?.message?.includes('fetch')) return failureCount < 5;
      // Retry twice for other errors
      return failureCount < 3;
    },
    retryDelay: 1000, // Shorter retry delay to get data faster
    // Error handling
    meta: {
      errorMessage: "Failed to load videos",
      suppressToasts: false // Show error toasts for better user feedback
    },
    // Always fetch fresh data on mount
    refetchOnMount: true,
    refetchOnWindowFocus: true // Refetch when window gets focus
  });

  // Force an immediate fetch when mounted and retry more aggressively if it fails
  useEffect(() => {
    console.log("useVideos mounted, triggering immediate fetch");
    refetch().catch(err => {
      console.error("Error in initial video fetch:", err);
      // Retry after short delay
      setTimeout(() => {
        console.log("Retrying fetch after initial error");
        refetch().catch(retryErr => {
          console.error("Error in retry fetch:", retryErr);
          // If still failing, increment retry counter to force a new query
          setRetryCount(prev => prev + 1);
        });
      }, 2000);
    });
  }, []);

  // Log data for debugging and try to fetch again if no data
  useEffect(() => {
    console.log(`useVideos: ${data?.length || 0} videos available`);
    
    if (!data || data.length === 0) {
      console.log("No video data available, triggering forced refetch");
      // Try to force fetch if we have no data
      setTimeout(() => {
        forceRefetch().catch(err => {
          console.error("Error force refetching videos:", err);
          // If still failing, increment retry counter
          setRetryCount(prev => prev + 1);
        });
      }, 1000);
    }
  }, [data, refetch, forceRefetch]);

  // Handle manual refresh with force option
  const handleForceRefetch = async () => {
    try {
      toast.info("Forcing refresh of all videos...");
      setRetryCount(prev => prev + 1);
      const freshData = await forceRefetch();
      console.log(`Force refetch completed, got ${freshData.length} videos`);
      return freshData;
    } catch (err) {
      console.error("Error in force refetch:", err);
      toast.error("Failed to refresh videos. Please try again later.");
      return [];
    }
  };

  return {
    data: data || [],
    isLoading,
    isFetching,
    error,
    refetch,
    forceRefetch: handleForceRefetch,
    lastSuccessfulFetch,
    fetchAttempts
  };
};
