
import { useEffect } from "react";
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
  // Function to clear cache and force refresh
  const clearCacheAndRefresh = async () => {
    if (isRefreshing || !forceRefetch) return;
    
    try {
      console.log("Auto clearing application cache...");
      await clearApplicationCache();
      
      // Short delay before refresh to ensure cache is cleared
      setTimeout(async () => {
        try {
          console.log("Auto refreshing content after cache clear...");
          await forceRefetch();
          console.log("Content refreshed successfully after cache clear");
        } catch (error) {
          console.error("Failed to refresh after cache clear:", error);
        }
      }, 300);
    } catch (error) {
      console.error("Failed to clear cache:", error);
    }
  };
  
  // Optimize refresh logic to immediately load real content
  useEffect(() => {
    // Skip if we're already refreshing
    if (isRefreshing || !forceRefetch) return;
    
    // Check if we have only sample videos (not real ones)
    const hasOnlySampleVideos = videos.length > 0 && 
      videos.every(v => 
        v.id.toString().includes('sample') || 
        v.video_id.includes('sample') ||
        v.channelName === "Sample Channel"
      );
    
    // Only trigger if we have missing or sample data
    if (videos.length === 0 || hasOnlySampleVideos) {
      console.log("No real videos detected, triggering immediate cache clear and refresh...");
      // Clear cache and force refresh to get real content
      clearCacheAndRefresh();
    } else if (lastSuccessfulFetch && 
        (new Date().getTime() - new Date(lastSuccessfulFetch).getTime() > 1800000) && // More than 30 minutes
        forceRefetch) {
      console.log("Content is stale (>30 minutes). Triggering automatic refresh...");
      // Add a small delay to avoid interfering with initial page load
      setTimeout(() => {
        forceRefetch().catch(error => {
          console.error("Failed to refresh stale content:", error);
        });
      }, 100); // Reduced from 200ms to 100ms
    }
  }, [videos, lastSuccessfulFetch, forceRefetch, isRefreshing]);
  
  // Handle cache clearing for any content over 1 hour (reduced from 2 hours)
  useEffect(() => {
    if (lastSuccessfulFetch && 
        new Date().getTime() - new Date(lastSuccessfulFetch).getTime() > 3600000 && // More than 1 hour
        !isRefreshing &&
        forceRefetch) {
      console.log("Content is stale (>1 hour). Clearing cache automatically...");
      clearCacheAndRefresh();
    }
  }, [lastSuccessfulFetch, isRefreshing, forceRefetch]);
  
  // Additional cache clearing on component mount to ensure fresh content
  useEffect(() => {
    // Check when the cache was last cleared
    const lastCacheClear = localStorage.getItem('lastCacheClearTime');
    const now = new Date().getTime();
    
    // If cache hasn't been cleared in the last 4 hours, clear it
    if (!lastCacheClear || (now - parseInt(lastCacheClear)) > 4 * 3600000) {
      console.log("No recent cache clearing detected. Performing scheduled cache clear...");
      
      // Only clear cache if we have a way to refresh content
      if (forceRefetch && !isRefreshing) {
        clearCacheAndRefresh().then(() => {
          // Record the time of this cache clear
          localStorage.setItem('lastCacheClearTime', now.toString());
        });
      }
    }
  }, []);
  
  // This is a utility component with no UI
  return null;
};
