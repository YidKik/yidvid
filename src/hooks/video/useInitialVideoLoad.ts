
import { useEffect } from "react";
import { VideoData } from "./types/video-fetcher";
import { hasRealVideos } from "./utils/validation";

interface UseInitialVideoLoadProps {
  data: VideoData[] | undefined;
  isLoading: boolean;
  refetch: () => Promise<any>;
  forceRefetch: () => Promise<any>;
  triggerRetry: () => void;
  setIsRefreshing?: (value: boolean) => void;
}

/**
 * Hook to handle initial data loading and refreshing
 */
export const useInitialVideoLoad = ({
  data,
  isLoading,
  refetch,
  forceRefetch,
  triggerRetry,
  setIsRefreshing
}: UseInitialVideoLoadProps) => {
  // Refresh once when mounted or data is empty
  useEffect(() => {
    const refreshNeeded = !isLoading && (!data || data.length === 0 || !hasRealVideos(data));
    
    if (refreshNeeded) {
      console.log("Initial data load needed - triggering refresh");
      if (setIsRefreshing) setIsRefreshing(true);
      
      const timer = setTimeout(() => {
        forceRefetch()
          .then(() => {
            console.log("Force refetch completed");
            if (setIsRefreshing) setIsRefreshing(false);
          })
          .catch(err => {
            console.error("Error in force refetch:", err);
            triggerRetry();
            if (setIsRefreshing) setIsRefreshing(false);
          });
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, data]);

  // Periodically check if the data still contains sample videos
  useEffect(() => {
    if (!data || isLoading) return;
    
    // Only refresh if we still have sample videos
    if (!hasRealVideos(data)) {
      const timer = setTimeout(() => {
        console.log("Still have sample videos - trying another refresh");
        if (setIsRefreshing) setIsRefreshing(true);
        
        refetch()
          .then(() => {
            if (setIsRefreshing) setIsRefreshing(false);
          })
          .catch(() => {
            if (setIsRefreshing) setIsRefreshing(false);
          });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [data, isLoading]);

  return null;
};
