
// This file needs to be updated to handle the proper parameter count in the triggerRetry function

// Update the interface for parameters to match implementation
interface UseInitialVideoLoadProps {
  data: any[];
  isLoading: boolean;
  refetch: () => Promise<any>;
  forceRefetch: () => Promise<any>;
  triggerRetry: () => void;
  setIsRefreshing: (isRefreshing: boolean) => void;
}

export const useInitialVideoLoad = ({
  data,
  isLoading,
  refetch,
  forceRefetch,
  triggerRetry,
  setIsRefreshing
}: UseInitialVideoLoadProps) => {
  // Initialize variables for tracking retry attempts
  const retryCount = React.useRef(0);
  const maxRetries = 3;
  
  useEffect(() => {
    // When no data is available and not currently loading, try to load videos
    if (!isLoading && (!data || data.length === 0)) {
      const attemptLoad = async () => {
        if (retryCount.current >= maxRetries) {
          console.log("Max retries reached, stopping auto-retry attempts");
          return;
        }
        
        retryCount.current++;
        console.log(`Auto-retry attempt ${retryCount.current}/${maxRetries}`);
        
        setIsRefreshing(true);
        try {
          // Try standard refetch first
          await refetch();
        } catch (err) {
          console.error("Error in auto-refetch:", err);
          
          // If standard refetch fails, try force refetch
          try {
            await forceRefetch();
          } catch (forceErr) {
            console.error("Force refetch also failed:", forceErr);
            
            // As last resort, trigger the retry counter in useVideoQuery
            triggerRetry();
          }
        } finally {
          setIsRefreshing(false);
        }
      };
      
      // Add a small delay before attempting to load
      const timer = setTimeout(() => {
        attemptLoad();
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    // Reset retry counter when we successfully get data
    if (data && data.length > 0) {
      retryCount.current = 0;
    }
  }, [data, isLoading, refetch, forceRefetch, triggerRetry, setIsRefreshing]);
};

// Add missing import
import React, { useEffect } from "react";
