
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useVideoRealtime } from "./useVideoRealtime";
import { useVideoFetcher, VideoData } from "./useVideoFetcher";

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

  // Initialize the video fetcher 
  const {
    fetchAllVideos,
    fetchAttempts,
    lastSuccessfulFetch,
    setFetchAttempts
  } = useVideoFetcher();

  // Set up the React Query
  const { data, isLoading, isFetching, error, refetch } = useQuery<VideoData[]>({
    queryKey: ["youtube_videos"],
    queryFn: fetchAllVideos,
    // Extremely conservative refetch intervals to conserve API quota
    refetchInterval: fetchAttempts > 3 ? 60 * 60 * 1000 : 30 * 60 * 1000, // 60 minutes if errors, 30 minutes normally
    staleTime: 25 * 60 * 1000, // Consider data stale after 25 minutes
    gcTime: 1000 * 60 * 60, // Cache data for 60 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on quota exceeded
      if (error?.status === 429) return false;
      // Retry other errors up to 2 times only (reduced from 3)
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 60000), // Exponential backoff with higher max
    // Don't use error boundary for this query
    meta: {
      errorMessage: "Failed to load videos"
    },
    // Silent failure - don't show errors to users in toasts
    onError: (error) => {
      console.error("Video fetch error handled silently:", error);
    }
  });

  // Force an immediate fetch when mounted, but only once
  useEffect(() => {
    // We'll only force a fresh fetch if it's been more than 6 hours since last fetch
    const shouldFetchFresh = !lastSuccessfulFetch || 
                             (Date.now() - lastSuccessfulFetch.getTime() > 6 * 60 * 60 * 1000);
    
    if (shouldFetchFresh) {
      refetch();
    }
  }, [refetch, lastSuccessfulFetch]);

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
