
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { clearApplicationCache } from "@/lib/query-client";

export const useRecoveryRefresh = (forceRefetch?: () => Promise<any>, networkOffline = false) => {
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  
  const recoveryRefresh = useCallback(async () => {
    if (!forceRefetch || networkOffline) return;
    
    setIsManualRefreshing(true);
    
    try {
      // Clear cache first
      clearApplicationCache();
      toast.loading("Refreshing content...");
      
      // Short delay to let cache clear
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await forceRefetch();
      toast.success("Content refreshed successfully");
    } catch (err) {
      console.error("Recovery refresh failed:", err);
      toast.error("Refresh failed", {
        description: "Please check your connection and try again"
      });
    } finally {
      setIsManualRefreshing(false);
    }
  }, [forceRefetch, networkOffline]);
  
  return { isManualRefreshing, recoveryRefresh };
};
