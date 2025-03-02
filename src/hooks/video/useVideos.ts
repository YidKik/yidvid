
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
    // Significantly reduced refetch intervals to conserve API quota
    refetchInterval: fetchAttempts > 3 ? 15 * 60 * 1000 : 5 * 60 * 1000, // 15 minutes if errors, 5 minutes normally
    staleTime: 4 * 60 * 1000, // Consider data stale after 4 minutes
    gcTime: 1000 * 60 * 30, // Cache data for 30 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on quota exceeded
      if (error?.status === 429) return false;
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 30000), // Exponential backoff
  });

  // Force an immediate fetch when mounted
  useEffect(() => {
    refetch();
  }, [refetch]);

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
