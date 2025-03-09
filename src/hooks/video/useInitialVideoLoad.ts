
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
 */
export const useInitialVideoLoad = ({
  data,
  isLoading,
  refetch,
  forceRefetch,
  triggerRetry,
  setIsRefreshing
}: UseInitialVideoLoadProps) => {
  // Optimize refresh logic to reduce unnecessary refreshes
  useEffect(() => {
    // Only refresh if we have no data or only sample data
    const refreshNeeded = !isLoading && (!data || data.length === 0 || !hasRealVideos(data));
    
    if (refreshNeeded) {
      console.log("Initial data load needed - triggering refresh");
      if (setIsRefreshing) setIsRefreshing(true);
      
      // Use a shorter timeout for faster initial load
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
      }, 500); // Reduced from 1500ms to 500ms for faster initial load
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, data]);

  // Remove the second effect that was checking for sample videos again
  // as it was causing duplicate refresh attempts

  return null;
};
