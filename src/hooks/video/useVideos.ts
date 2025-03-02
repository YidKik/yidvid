
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useVideoRealtime } from "./useVideoRealtime";
import { useVideoFetcher, VideoData } from "./useVideoFetcher";
import { toast } from "sonner";

export interface UseVideosResult {
  data: VideoData[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
  lastSuccessfulFetch: Date | null;
  fetchAttempts: number;
}

export const useVideos = (): UseVideosResult => {
  // Set up real-time subscription for video changes
  useVideoRealtime();

  // Initialize the video fetcher with more reliable error handling
  const {
    fetchAllVideos,
    fetchAttempts,
    lastSuccessfulFetch,
    setFetchAttempts
  } = useVideoFetcher();

  // Set up React Query with more robust error handling and retry strategy
  const { data, isLoading, isFetching, error, refetch } = useQuery<VideoData[]>({
    queryKey: ["youtube_videos"],
    queryFn: fetchAllVideos,
    refetchInterval: 30 * 60 * 1000, // Always refetch every 30 minutes
    staleTime: 10 * 60 * 1000, // Consider data stale after 10 minutes
    gcTime: 60 * 60 * 1000, // Cache data for 60 minutes
    retry: (failureCount) => {
      // Always retry at least once, regardless of error type
      return failureCount < 2;
    },
    retryDelay: 1000, // Shorter retry delay to get data faster
    // Error handling
    meta: {
      errorMessage: "Failed to load videos",
      suppressToasts: true // Don't show error toasts since we have fallback data
    },
    // Always fetch fresh data on mount
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  // Force an immediate fetch when mounted
  useEffect(() => {
    console.log("useVideos mounted, triggering immediate fetch");
    refetch().catch(err => {
      console.error("Error in initial video fetch:", err);
    });
  }, []);

  // Log data for debugging
  useEffect(() => {
    console.log(`useVideos: ${data?.length || 0} videos available`);
    
    if (!data || data.length === 0) {
      console.log("No video data available, triggering refetch");
      // Try to fetch again if we have no data
      setTimeout(() => {
        refetch().catch(err => {
          console.error("Error refetching videos:", err);
        });
      }, 1000);
    }
  }, [data, refetch]);

  return {
    data: data || [],
    isLoading,
    isFetching,
    error,
    refetch,
    lastSuccessfulFetch,
    fetchAttempts
  };
};
