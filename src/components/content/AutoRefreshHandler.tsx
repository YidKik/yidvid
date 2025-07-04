
import { useEffect, useState, useRef } from "react";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { toast } from "sonner";
import { clearApplicationCache } from "@/lib/query-client";

interface AutoRefreshHandlerProps {
  videos: VideoData[];
  isRefreshing: boolean;
  lastSuccessfulFetch?: Date | null;
  forceRefetch?: () => Promise<any>;
}

export const AutoRefreshHandler: React.FC<AutoRefreshHandlerProps> = ({
  videos,
  isRefreshing,
  lastSuccessfulFetch,
  forceRefetch
}) => {
  const [lastCacheClear, setLastCacheClear] = useState<number | null>(null);
  const hasTriggeredInitialFetch = useRef(false);
  const refreshAttempts = useRef(0);
  
  // Function to clear cache and force refresh with rate limiting
  const clearCacheAndRefresh = async () => {
    if (isRefreshing || !forceRefetch) return;
    
    // Check if we've cleared cache recently (within 5 minutes)
    const now = new Date().getTime();
    if (lastCacheClear && now - lastCacheClear < 5 * 60 * 1000) {
      console.log("Skipping cache clear - too recent");
      return;
    }
    
    try {
      console.log("Auto clearing application cache...");
      await clearApplicationCache();
      setLastCacheClear(now);
      
      // Store in localStorage to persist between sessions
      localStorage.setItem('lastCacheClearTime', now.toString());
      
      // Short delay before refresh to ensure cache is cleared
      setTimeout(async () => {
        if (!isRefreshing) {
          refreshAttempts.current += 1;
          try {
            console.log("Auto refreshing content after cache clear...");
            await forceRefetch();
            // Reset attempt counter on success
            refreshAttempts.current = 0;
            console.log("Content refreshed successfully after cache clear");
          } catch (error) {
            console.error("Failed to refresh after cache clear:", error);
            
            // If too many consecutive fails, show a helpful message
            if (refreshAttempts.current >= 3) {
              toast.error("Refresh issue detected", {
                description: "Try signing out and signing back in to resolve authentication issues",
                duration: 8000
              });
            }
          }
        }
      }, 500);
    } catch (error) {
      console.error("Failed to clear cache:", error);
    }
  };
  
  // DISABLED: Auto-refresh to prevent excessive function calls
  // Only allow manual refresh to reduce API usage
  useEffect(() => {
    // Skip all automatic refreshing - only manual refresh allowed
    if (isRefreshing || !forceRefetch || hasTriggeredInitialFetch.current) return;
    
    // Only refresh once on initial load if absolutely no data
    if (videos.length === 0) {
      console.log("No videos detected on initial load - single refresh attempt");
      hasTriggeredInitialFetch.current = true;
      forceRefetch().catch(error => {
        console.error("Initial refresh failed:", error);
      });
    }
    // Remove all other auto-refresh logic
  }, [videos, forceRefetch, isRefreshing]);
  
  // DISABLED: Hourly cache clearing to prevent excessive function calls
  // Content will only be refreshed manually to stay within limits
  
  // This component intentionally has no UI
  return null;
};
