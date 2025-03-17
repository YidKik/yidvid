
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
 * Hook to handle initial data loading and refreshing with optimized performance
 * Now prioritizes showing UI quickly and loading data in the background
 */
export const useInitialVideoLoad = ({
  data,
  isLoading,
  refetch,
  forceRefetch,
  triggerRetry,
  setIsRefreshing
}: UseInitialVideoLoadProps) => {
  // Optimize refresh logic to reduce unnecessary refreshes and speed up initial loading
  useEffect(() => {
    // Only refresh if we have no data or only sample data, but add a delay
    // to allow the UI to render first
    const refreshNeeded = !isLoading && (!data || data.length === 0 || !hasRealVideos(data));
    
    if (refreshNeeded) {
      console.log("Initial data load needed - scheduling background refresh");
      
      // Don't set refreshing state immediately to avoid loading indicators
      // Let the UI render with sample data first
      const timer = setTimeout(() => {
        if (setIsRefreshing) setIsRefreshing(true);
        
        forceRefetch()
          .then(() => {
            console.log("Background force refetch completed");
            if (setIsRefreshing) setIsRefreshing(false);
          })
          .catch(err => {
            console.error("Error in background force refetch:", err);
            triggerRetry();
            if (setIsRefreshing) setIsRefreshing(false);
          });
      }, 2000); // Schedule the actual fetch after UI has rendered
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, data]);

  return null;
};
