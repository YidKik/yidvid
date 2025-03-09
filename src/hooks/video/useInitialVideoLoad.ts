
import { useEffect, useRef } from "react";
import { VideoData } from "./types/video-fetcher";
import { hasRealVideos } from "./utils/validation";
import { useLocation } from "react-router-dom";

interface UseInitialVideoLoadProps {
  data: VideoData[] | undefined;
  isLoading: boolean;
  refetch: () => Promise<any>;
  forceRefetch: () => Promise<any>;
  triggerRetry: () => void;
}

/**
 * Hook to handle initial video loading and refreshing
 */
export const useInitialVideoLoad = ({
  data,
  isLoading,
  refetch,
  forceRefetch,
  triggerRetry
}: UseInitialVideoLoadProps) => {
  const toastShownRef = useRef(false);
  const location = useLocation();
  const isMainPage = location.pathname === "/";

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
            triggerRetry();
          });
        }, 1000); // Reduced from 2000ms to 1000ms
      });
    } else {
      console.log(`Using ${data?.length || 0} cached real videos`);
    }
  }, []);

  // Log data for debugging and try to fetch again if no data
  useEffect(() => {
    console.log(`useVideos: ${data?.length || 0} videos available`);
    
    if (!hasRealVideos(data) && !isMainPage) {
      console.log("No real video data available, triggering forced refetch...");
      
      // Try to force fetch if we have no real data, with delay to prevent race conditions
      setTimeout(() => {
        forceRefetch().catch(err => {
          console.error("Error force refetching videos:", err);
          // If still failing, increment retry counter
          triggerRetry();
        });
      }, 800); // Reduced from 1000ms to 800ms
    }
  }, [data, forceRefetch, isMainPage]);

  return {
    refreshInitiated: true
  };
};
