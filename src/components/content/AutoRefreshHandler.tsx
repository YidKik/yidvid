
import { useEffect } from "react";
import { VideoData } from "@/hooks/video/types/video-fetcher";

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
    if (!videos || videos.length === 0 || 
        videos[0].id.toString().startsWith('sample')) {
      console.log("No real videos detected, triggering force refresh...");
      if (forceRefetch && !isRefreshing) {
        forceRefetch();
      }
    } else if (lastSuccessfulFetch && 
        (new Date().getTime() - new Date(lastSuccessfulFetch).getTime() > 86400000) && // More than 24 hours
        forceRefetch && !isRefreshing) {
      console.log("Content is stale (>24 hours). Triggering automatic refresh...");
      forceRefetch();
    }
  }, [videos, lastSuccessfulFetch, forceRefetch, isRefreshing]);
  
  // This is a utility component with no UI
  return null;
};
