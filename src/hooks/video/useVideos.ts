
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

  // Initialize the video fetcher 
  const {
    fetchAllVideos,
    fetchAttempts,
    lastSuccessfulFetch,
    setFetchAttempts
  } = useVideoFetcher();

  // Set up the React Query with more robust error handling
  const { data, isLoading, isFetching, error, refetch } = useQuery<VideoData[]>({
    queryKey: ["youtube_videos"],
    queryFn: fetchAllVideos,
    // Refetch intervals 
    refetchInterval: fetchAttempts > 3 ? 60 * 60 * 1000 : 30 * 60 * 1000, // 60 minutes if errors, 30 minutes normally
    staleTime: 25 * 60 * 1000, // Consider data stale after 25 minutes
    gcTime: 1000 * 60 * 60, // Cache data for 60 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on recursion errors - immediately use fallback
      if (error?.message?.includes('recursion detected')) return false;
      // Only retry once for other policy errors
      if (error?.message?.includes('policy')) return failureCount < 1;
      // Don't retry on quota exceeded
      if (error?.status === 429) return false;
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 10000), // Shorter backoff
    // Error handling
    meta: {
      errorMessage: "Failed to load videos",
      suppressToasts: true // Don't show error toasts since we have fallback data
    },
    // Always fetch fresh data on mount
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  // Force a fetch when there's no data, but only try once
  useEffect(() => {
    console.log("useVideos data:", data?.length || 0, "videos");
    
    if (!data || data.length === 0) {
      console.log("No video data available, triggering refetch");
      // Only try once to avoid infinite loops with RLS policy issues
      if (fetchAttempts < 2) {
        setTimeout(() => {
          refetch().catch(err => {
            console.error("Error refetching videos:", err);
            // Don't show toast for expected errors
            if (!err.message?.includes("recursion detected") && !err.message?.includes("policy")) {
              toast.error("Failed to load videos. Please try again later.");
            }
          });
        }, 1000);
      } else {
        console.log("Not retrying due to previous fetch attempts:", fetchAttempts);
      }
    }
  }, [data, refetch, fetchAttempts]);
  
  // Force an immediate fetch when mounted, but only once
  useEffect(() => {
    console.log("useVideos mounted, triggering initial fetch");
    // Only fetch fresh if we haven't done so recently
    if (!lastSuccessfulFetch || 
        (Date.now() - lastSuccessfulFetch.getTime() > 6 * 60 * 60 * 1000)) {
      console.log("Fetching fresh video data on mount");
      refetch().catch(err => {
        console.error("Error fetching videos on mount:", err);
      });
    }
  }, []);

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
