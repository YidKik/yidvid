
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useCallback, useRef } from "react";
import { MobileVideoView } from "./MobileVideoView";
import { DesktopVideoView } from "./DesktopVideoView";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useRefetchControl } from "@/hooks/video/useRefetchControl";
import { useSampleVideos } from "@/hooks/video/useSampleVideos";
import { AutoRefreshHandler } from "./AutoRefreshHandler";
import { VideoEmptyState } from "./VideoEmptyState";
import { clearApplicationCache } from "@/lib/query-client";
import { toast } from "sonner";
import { useSessionManager } from "@/hooks/useSessionManager";
import { useQueryClient } from "@tanstack/react-query";

interface VideoContentProps {
  videos: VideoData[];
  isLoading: boolean;
  isRefreshing: boolean;
  refetch?: () => Promise<any>;
  forceRefetch?: () => Promise<any>;
  lastSuccessfulFetch?: Date | null;
  fetchAttempts?: number;
}

export const VideoContent = ({ 
  videos, 
  isLoading, 
  isRefreshing, 
  refetch,
  forceRefetch,
  lastSuccessfulFetch,
  fetchAttempts
}: VideoContentProps) => {
  const { isMobile } = useIsMobile();
  const { 
    isRefreshing: isInternalRefreshing, 
    handleRefetch, 
    handleForceRefetch 
  } = useRefetchControl({ refetch, forceRefetch });
  
  const { 
    createSampleVideos,
    hasOnlySampleVideos 
  } = useSampleVideos();

  const { session } = useSessionManager();
  const queryClient = useQueryClient();
  
  // Track if we've already attempted background refresh
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);
  const initialLoadAttemptMade = useRef(false);
  const userChangedRef = useRef(session?.user?.id);
  
  // Trigger a fresh load when auth state changes
  useEffect(() => {
    if (userChangedRef.current !== session?.user?.id) {
      userChangedRef.current = session?.user?.id;
      console.log("User authentication state changed, refreshing videos...");
      
      if (forceRefetch) {
        // Clear any cached data first
        clearApplicationCache();
        queryClient.invalidateQueries({ queryKey: ["youtube_videos"] });
        
        // Short delay to let auth state fully update
        setTimeout(() => {
          forceRefetch().catch(err => {
            console.error("Error refreshing after auth change:", err);
          });
        }, 300);
      }
    }
  }, [session?.user?.id, forceRefetch, queryClient]);
  
  // Trigger initial load if needed
  useEffect(() => {
    if (!initialLoadAttemptMade.current && !isLoading && !isRefreshing && 
        forceRefetch && videos.length === 0) {
      initialLoadAttemptMade.current = true;
      
      // Check refresh rate limits
      const lastInitialLoad = localStorage.getItem('lastInitialLoadTime');
      const now = new Date().getTime();
      
      // Limit to once every 30 seconds
      if (!lastInitialLoad || (now - parseInt(lastInitialLoad) > 30 * 1000)) {
        localStorage.setItem('lastInitialLoadTime', now.toString());
        console.log("No videos found on initial load, triggering fetch...");
        
        // Short delay to let UI render first
        setTimeout(() => {
          forceRefetch().catch(err => {
            console.error("Error in initial fetch:", err);
          });
        }, 200);
      }
    }
  }, [isLoading, isRefreshing, forceRefetch, videos.length]);

  // Always show some content immediately, whether user is logged in or not
  const displayVideos = videos?.length ? videos : createSampleVideos(8);
  
  // Check if we're only displaying sample videos (fallback content)
  const hasSampleVideosOnly = hasOnlySampleVideos(displayVideos);
  
  // Handle fetch error case
  const hasNoRealVideos = videos.length === 0 || hasSampleVideosOnly;
  const showRetryButton = !isLoading && !isRefreshing && hasNoRealVideos && fetchAttempts && fetchAttempts > 1;

  return (
    <div>
      {/* Component to handle automatic refresh of stale content */}
      <AutoRefreshHandler
        videos={displayVideos}
        isRefreshing={isRefreshing || isInternalRefreshing}
        lastSuccessfulFetch={lastSuccessfulFetch}
        forceRefetch={forceRefetch}
      />
      
      {/* Show retry action if we've made multiple attempts but still have no videos */}
      {showRetryButton && (
        <div className="flex justify-center my-4">
          <button
            onClick={() => forceRefetch && handleForceRefetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            Reload Videos
          </button>
        </div>
      )}
      
      {/* Responsive video view based on device */}
      {isMobile ? (
        <MobileVideoView
          videos={displayVideos}
          isLoading={isLoading}
          isRefreshing={isRefreshing || isInternalRefreshing}
          refetch={handleRefetch}
          forceRefetch={handleForceRefetch}
          lastSuccessfulFetch={lastSuccessfulFetch}
          fetchAttempts={fetchAttempts || 0}
        />
      ) : (
        <DesktopVideoView
          videos={displayVideos}
          isLoading={isLoading}
          isRefreshing={isRefreshing || isInternalRefreshing}
          refetch={handleRefetch}
          forceRefetch={handleForceRefetch}
          lastSuccessfulFetch={lastSuccessfulFetch}
          fetchAttempts={fetchAttempts || 0}
        />
      )}
    </div>
  );
};
