
import { useState, useCallback } from "react";

interface UseRefetchControlProps {
  refetch?: () => Promise<any>;
  forceRefetch?: () => Promise<any>;
}

export const useRefetchControl = ({ 
  refetch, 
  forceRefetch 
}: UseRefetchControlProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefetch = useCallback(async () => {
    if (!refetch) return;
    
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error during refetch:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleForceRefetch = useCallback(async () => {
    if (!forceRefetch) return;
    
    setIsRefreshing(true);
    try {
      await forceRefetch();
    } catch (error) {
      console.error("Error during force refetch:", error);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500); // Short delay for better UX
    }
  }, [forceRefetch]);

  return {
    isRefreshing,
    handleRefetch,
    handleForceRefetch
  };
};
