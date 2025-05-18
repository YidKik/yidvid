
import { useState, useEffect } from "react";
import { useVideoRealtime } from "./useVideoRealtime";
import { useVideoFetcher } from "./useVideoFetcher";
import { useAuthStateListener } from "./useAuthStateListener";
import { useVideoQuery } from "./useVideoQuery";
import { useInitialVideoLoad } from "./useInitialVideoLoad";
import { filterUnavailableVideos } from "./utils/validation";
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
  progressiveLoading: {
    firstPageLoaded: boolean;
    remainingPagesLoading: boolean;
  };
}

export const useVideos = (): UseVideosResult => {
  const [authState, setAuthState] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  const [progressiveLoading, setProgressiveLoading] = useState({
    firstPageLoaded: false,
    remainingPagesLoading: true
  });
  
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

  // Handle progressive loading for better user experience
  useEffect(() => {
    if (!isLoading && data.length > 0 && !progressiveLoading.firstPageLoaded) {
      // Mark first page as loaded
      setProgressiveLoading(prev => ({ ...prev, firstPageLoaded: true }));
      
      // After a short delay, allow loading of remaining pages
      const timer = setTimeout(() => {
        setProgressiveLoading(prev => ({ ...prev, remainingPagesLoading: false }));
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, data, progressiveLoading.firstPageLoaded]);

  // Handle initial data loading with less aggressive refreshing
  useInitialVideoLoad({
    data,
    isLoading,
    refetch,
    forceRefetch: handleForceRefetch,
    triggerRetry,
    setIsRefreshing
  });

  // Return the data without falling back to sample data when loading
  return {
    data: data,
    isLoading,
    isFetching,
    isRefreshing,
    error,
    refetch,
    forceRefetch: handleForceRefetch,
    lastSuccessfulFetch,
    fetchAttempts,
    progressiveLoading
  };
};
