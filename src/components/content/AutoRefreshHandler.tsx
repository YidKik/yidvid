
import { useEffect, useState } from 'react';
import { VideoData } from '@/hooks/video/types/video-fetcher';

interface AutoRefreshHandlerProps {
  videos: VideoData[];
  isRefreshing: boolean;
  lastSuccessfulFetch: Date | null;
  forceRefetch?: () => Promise<any>;
}

export const AutoRefreshHandler = ({
  videos,
  isRefreshing,
  lastSuccessfulFetch,
  forceRefetch
}: AutoRefreshHandlerProps) => {
  const [lastAutoRefresh, setLastAutoRefresh] = useState<Date | null>(null);
  
  useEffect(() => {
    if (!forceRefetch || isRefreshing || !navigator.onLine) {
      return;
    }
    
    // Check if content is stale (over 30 minutes since last fetch)
    const shouldRefresh = lastSuccessfulFetch && 
      (new Date().getTime() - lastSuccessfulFetch.getTime() > 30 * 60 * 1000);
    
    // Check if we've auto-refreshed recently
    const canAutoRefresh = !lastAutoRefresh || 
      (new Date().getTime() - lastAutoRefresh.getTime() > 5 * 60 * 1000);
    
    if (shouldRefresh && canAutoRefresh && videos.length > 0) {
      console.log("Content is stale, auto-refreshing...");
      setLastAutoRefresh(new Date());
      
      forceRefetch().catch(error => {
        console.error("Auto-refresh failed:", error);
      });
    }
  }, [videos, lastSuccessfulFetch, forceRefetch, isRefreshing, lastAutoRefresh]);

  // This component doesn't render anything visible
  return null;
};
