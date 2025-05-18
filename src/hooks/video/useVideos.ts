
import { useState } from "react";
import { useVideoRealtime } from "./useVideoRealtime";
import { useVideoFetcher } from "./useVideoFetcher";
import { useAuthStateListener } from "./useAuthStateListener";
import { useVideoQuery } from "./useVideoQuery";
import { useInitialVideoLoad } from "./useInitialVideoLoad";
import { hasRealVideos, createSampleVideos } from "./utils/validation";
import { VideoData } from "./types/video-fetcher";
import { useSessionManager } from "@/hooks/useSessionManager";

export interface UseVideosResult {
  data: VideoData[];
  isLoading: boolean;
  isFetching: boolean;
  isRefreshing: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
  forceRefetch: () => Promise<any>;
  lastSuccessfulFetch: Date | null;
  fetchAttempts: number;
}

export const useVideos = (): UseVideosResult => {
  const [authState, setAuthState] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { session } = useSessionManager();
  
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

  // Set up auth state listener to trigger refreshes on login/logout
  useAuthStateListener(setAuthState);

  // Set up React Query for videos
  const { 
    data, 
    isLoading, 
    isFetching, 
    error, 
    refetch,
    forceRefetch: handleForceRefetch,
    triggerRetry
  } = useVideoQuery({
    fetchAllVideos,
    forceRefetch,
    authState
  });

  // Handle initial data loading and refreshing
  useInitialVideoLoad({
    data,
    isLoading,
    refetch,
    forceRefetch: handleForceRefetch,
    triggerRetry,
    setIsRefreshing
  });

  // Ensure we always return data whether authenticated or not
  // We no longer check authentication status - always show available content
  const ensuredData = hasRealVideos(data) ? data : (data?.length ? data : createSampleVideos());

  return {
    data: ensuredData,
    isLoading,
    isFetching,
    isRefreshing,
    error,
    refetch,
    forceRefetch: handleForceRefetch,
    lastSuccessfulFetch,
    fetchAttempts
  };
};
