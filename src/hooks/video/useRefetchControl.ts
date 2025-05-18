
import { useState } from "react";
import { toast } from "sonner";

interface UseRefetchControlProps {
  refetch?: () => Promise<any>;
  forceRefetch?: () => Promise<any>;
}

export const useRefetchControl = ({ 
  refetch, 
  forceRefetch 
}: UseRefetchControlProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshToastIdRef = { current: null as string | null };
  
  const handleRefetch = async () => {
    if (refetch && !isRefreshing) {
      console.log("Manual refresh triggered");
      setIsRefreshing(true);
      
      try {
        await refetch();
        // Use a unique ID for the toast to prevent duplicates
        toast.success("Content refreshed", { 
          id: "content-refreshed",
          position: "bottom-center" 
        });
      } catch (error) {
        console.error("Error during manual refetch:", error);
      } finally {
        setTimeout(() => setIsRefreshing(false), 1000);
      }
    }
  };

  const handleForceRefetch = async () => {
    if (forceRefetch && !isRefreshing) {
      console.log("Force refresh triggered");
      setIsRefreshing(true);
      
      // Clear any previous refresh toast
      if (refreshToastIdRef.current) {
        toast.dismiss(refreshToastIdRef.current);
      }
      
      try {
        await forceRefetch();
        // Use a unique ID for the toast to prevent duplicates
        refreshToastIdRef.current = "content-completely-refreshed";
        toast.success("Content completely refreshed with latest data", { 
          id: refreshToastIdRef.current,
          position: "bottom-center"
        });
      } catch (error) {
        console.error("Error during force refetch:", error);
      } finally {
        setTimeout(() => setIsRefreshing(false), 1000);
      }
    }
  };

  return {
    isRefreshing,
    handleRefetch,
    handleForceRefetch
  };
};
