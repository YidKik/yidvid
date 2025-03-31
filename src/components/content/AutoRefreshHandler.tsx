
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
          try {
            console.log("Auto refreshing content after cache clear...");
            await forceRefetch();
            console.log("Content refreshed successfully after cache clear");
          } catch (error) {
            console.error("Failed to refresh after cache clear:", error);
          }
        }
      }, 300);
    } catch (error) {
      console.error("Failed to clear cache:", error);
    }
  };
  
  // Optimize refresh logic to immediately load real content
  useEffect(() => {
    // Skip if we're already refreshing or if we've already triggered an initial fetch
    if (isRefreshing || !forceRefetch || hasTriggeredInitialFetch.current) return;
    
    // Check if we have only sample videos (not real ones)
    const hasOnlySampleVideos = videos.length > 0 && 
      videos.every(v => 
        v.id.toString().includes('sample') || 
        v.video_id.includes('sample') ||
        v.channelName === "Sample Channel"
      );
    
    // Only trigger if we have missing or sample data and haven't triggered before
    if (videos.length === 0 || hasOnlySampleVideos) {
      console.log("No real videos detected, triggering immediate cache clear and refresh...");
      // Mark that we've triggered an initial fetch
      hasTriggeredInitialFetch.current = true;
      // Clear cache and force refresh to get real content
      clearCacheAndRefresh();
    } else if (lastSuccessfulFetch && 
        (new Date().getTime() - new Date(lastSuccessfulFetch).getTime() > 1800000) && // More than 30 minutes
        forceRefetch) {
      console.log("Content is stale (>30 minutes). Triggering automatic refresh...");
      // Add a small delay to avoid interfering with initial page load
      setTimeout(() => {
        if (!isRefreshing) {
          forceRefetch().catch(error => {
            console.error("Failed to refresh stale content:", error);
          });
        }
      }, 100);
    }
  }, [videos, lastSuccessfulFetch, forceRefetch, isRefreshing]);
  
  // Handle cache clearing for any content over 1 hour (reduced from 2 hours)
  useEffect(() => {
    if (lastSuccessfulFetch && 
        new Date().getTime() - new Date(lastSuccessfulFetch).getTime() > 3600000 && // More than 1 hour
        !isRefreshing &&
        forceRefetch) {
      const lastRefresh = localStorage.getItem('lastHourlyRefresh');
      const now = new Date().getTime();
      
      if (!lastRefresh || now - parseInt(lastRefresh) > 30 * 60 * 1000) {
        console.log("Content is stale (>1 hour). Clearing cache automatically...");
        clearCacheAndRefresh();
        localStorage.setItem('lastHourlyRefresh', now.toString());
      }
    }
  }, [lastSuccessfulFetch, isRefreshing, forceRefetch]);
  
  // This component intentionally has no UI
  return null;
};
