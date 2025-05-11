
import { useState } from "react";
import { useVideoRealtime } from "./useVideoRealtime";
import { useVideoFetcher } from "./useVideoFetcher";
import { useAuthStateListener } from "./useAuthStateListener";
import { useVideoQuery } from "./useVideoQuery";
import { useInitialVideoLoad } from "./useInitialVideoLoad";
import { hasRealVideos, createSampleVideos, filterUnavailableVideos } from "./utils/validation";
import { VideoData } from "./types/video-fetcher";

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
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  
  // Set up auth state listener to trigger refreshes on login/logout
  useAuthStateListener(setAuthState);
  
  // Initialize the video fetcher with optimized performance
  const {
    fetchAllVideos,
    forceRefetch,
    fetchAttempts,
    lastSuccessfulFetch,
    setFetchAttempts
  } = useVideoFetcher();

  // Check network connection status
  const checkNetwork = () => {
    const isOnline = navigator.onLine;
    if (offlineMode !== !isOnline) {
      setOfflineMode(!isOnline);
      console.log(`Network status changed: ${isOnline ? 'online' : 'offline'}`);
    }
    return isOnline;
  };

  // Set up React Query for videos with optimized caching
  const { 
    data: unfilteredData, 
    isLoading, 
    isFetching, 
    error, 
    refetch,
    forceRefetch: handleForceRefetch,
    triggerRetry
  } = useVideoQuery({
    fetchAllVideos,
    forceRefetch,
    authState,
    checkNetwork
  });

  // Filter out unavailable videos with optimized performance
  const data = filterUnavailableVideos(unfilteredData || []);

  // Handle initial data loading with less aggressive refreshing
  useInitialVideoLoad({
    data,
    isLoading,
    refetch,
    forceRefetch: handleForceRefetch,
    triggerRetry,
    setIsRefreshing
  });

  // Always use real data if available, and fall back to sample data if needed
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
