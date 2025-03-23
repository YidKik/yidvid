
import { useEffect } from "react";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { toast } from "sonner";

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
      console.log("No real videos detected, triggering immediate force refresh...");
      // Almost immediate refresh for better user experience
      setTimeout(() => {
        forceRefetch().catch(error => {
          console.error("Failed to force refresh videos:", error);
        });
      }, 10); // Almost immediate load (just enough time for UI to render)
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
  
  // This is a utility component with no UI
  return null;
};
