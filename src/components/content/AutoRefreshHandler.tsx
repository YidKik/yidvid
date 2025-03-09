
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
  // Always show force fetch button and trigger automatic refresh if stale
  useEffect(() => {
    // Check if we have only sample videos (not real ones)
    const hasOnlySampleVideos = videos.length > 0 && 
      videos.every(v => v.id.toString().includes('sample') || v.video_id.includes('sample'));
    
    // Only trigger if we have missing data and not already refreshing
    if (!isRefreshing && (videos.length === 0 || hasOnlySampleVideos)) {
      console.log("No real videos detected, triggering immediate force refresh...");
      if (forceRefetch) {
        // Shorter delay to fetch real content faster
        setTimeout(() => {
          forceRefetch().catch(error => {
            console.error("Failed to force refresh videos:", error);
            toast.error("Failed to refresh content. Please try again later.");
          });
        }, 100); // Reduced from 300ms to 100ms for faster load
      }
    } else if (!isRefreshing && lastSuccessfulFetch && 
        (new Date().getTime() - new Date(lastSuccessfulFetch).getTime() > 900000) && // More than 15 minutes (reduced from 30 minutes)
        forceRefetch) {
      console.log("Content is stale (>15 minutes). Triggering automatic refresh...");
      // Add a small delay to avoid interfering with initial page load
      setTimeout(() => {
        forceRefetch().catch(error => {
          console.error("Failed to refresh stale content:", error);
        });
      }, 200); // Reduced from 500ms to 200ms
    }
  }, [videos, lastSuccessfulFetch, forceRefetch, isRefreshing]);
  
  // This is a utility component with no UI
  return null;
};
