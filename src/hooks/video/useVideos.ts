
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { useVideoRealtime } from "./useVideoRealtime";
import { useVideoFetcher, VideoData } from "./useVideoFetcher";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();
  const isMainPage = location.pathname === "/";
  const toastShownRef = useRef(false);
  
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

  // Helper to check if videos are real or sample data
  const hasRealVideos = (videos: VideoData[] | undefined): boolean => {
    if (!videos || videos.length === 0) return false;
    
    return videos.some(v => 
      !v.id.toString().includes('sample') && 
      v.channelName !== "Sample Channel" &&
      !v.video_id.includes('sample')
    );
  };

  // Set up React Query with more aggressive refetching strategy
  const { data, isLoading, isFetching, error, refetch } = useQuery<VideoData[]>({
    queryKey: ["youtube_videos", retryCount], // Add retryCount to force refetch
    queryFn: fetchAllVideos,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 1 * 60 * 1000, // Consider data stale after 1 minute
    gcTime: 30 * 60 * 1000, // Cache data for 30 minutes
    retry: (failureCount, error: any) => {
      // Don't retry quota errors
      if (error?.message?.includes('quota')) return false;
      // Retry network errors up to 5 times
      if (error?.message?.includes('network') || error?.message?.includes('fetch')) return failureCount < 5;
      // Retry twice for other errors
      return failureCount < 3;
    },
    retryDelay: 1000, // Shorter retry delay
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

  // Force an immediate fetch when mounted and retry more aggressively if it fails
  useEffect(() => {
    console.log("useVideos mounted, checking cached data");
    toastShownRef.current = false;
    
    // Only refetch if we don't have real videos
    if (!hasRealVideos(data)) {
      console.log("No real videos in cache, triggering fetch");
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
    } else {
      console.log(`Using ${data.length} cached real videos`);
    }
  }, []);

  // Log data for debugging and try to fetch again if no data
  useEffect(() => {
    console.log(`useVideos: ${data?.length || 0} videos available`);
    
    if (!hasRealVideos(data) && !isMainPage) {
      console.log("No real video data available, triggering forced refetch");
      
      // Try to force fetch if we have no real data, with delay to prevent race conditions
      setTimeout(() => {
        forceRefetch().catch(err => {
          console.error("Error force refetching videos:", err);
          // If still failing, increment retry counter
          setRetryCount(prev => prev + 1);
        });
      }, 1000);
    }
  }, [data, forceRefetch, isMainPage]);

  // Handle manual refresh with force option
  const handleForceRefetch = async () => {
    try {
      // Reset toast flag when manually refreshing
      toastShownRef.current = false;
      
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

  // Create sample videos for fallback if needed
  const createSampleVideos = (): VideoData[] => {
    const now = new Date();
    return Array(12).fill(null).map((_, i) => ({
      id: `sample-${i}`,
      video_id: `sample-vid-${i}`,
      title: `Sample Video ${i+1}`,
      thumbnail: '/placeholder.svg',
      channelName: "Sample Channel",
      channelId: "sample-channel",
      views: 1000 * (i+1),
      uploadedAt: new Date(now.getTime() - (i * 86400000)).toISOString(),
      category: "other",
      description: "This is a sample video until real content loads."
    }));
  };

  // Always ensure we have some data to display
  const ensuredData = hasRealVideos(data) ? data : (data?.length ? data : createSampleVideos());

  return {
    data: ensuredData,
    isLoading,
    isFetching,
    error,
    refetch,
    forceRefetch: handleForceRefetch,
    lastSuccessfulFetch,
    fetchAttempts
  };
};
