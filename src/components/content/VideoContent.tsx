
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

interface VideoContentProps {
  videos: VideoData[];
  isLoading: boolean;
  refetch?: () => Promise<any>;
  forceRefetch?: () => Promise<any>;
  lastSuccessfulFetch?: Date | null;
  fetchAttempts?: number;
}

export const VideoContent = ({ 
  videos, 
  isLoading, 
  refetch,
  forceRefetch,
  lastSuccessfulFetch,
  fetchAttempts
}: VideoContentProps) => {
  const { isMobile } = useIsMobile();
  const { 
    isRefreshing, 
    handleRefetch, 
    handleForceRefetch 
  } = useRefetchControl({ refetch, forceRefetch });
  
  const { 
    createSampleVideos,
    hasOnlySampleVideos 
  } = useSampleVideos();

  const { session } = useSessionManager();
  
  // Track if we've already attempted background refresh
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);
  const initialLoadAttemptMade = useRef(false);
  const userChangedRef = useRef(session?.user?.id);
  
  // Handle auth state changes to trigger a video refresh
  useEffect(() => {
    if (userChangedRef.current !== session?.user?.id) {
      userChangedRef.current = session?.user?.id;
      console.log("User authentication state changed, refreshing videos...");
      
      if (forceRefetch) {
        // Clear any cached data first
        clearApplicationCache();
        
        // Short delay to let auth state fully update
        setTimeout(() => {
          forceRefetch().catch(err => {
            console.error("Error refreshing after auth change:", err);
          });
        }, 300);
      }
    }
  }, [session?.user?.id, forceRefetch]);
  
  // Add a check for infinite refresh loops
  useEffect(() => {
    // If we have a very high fetch attempt count, it likely indicates a loop
    if (fetchAttempts && fetchAttempts > 20) {
      // Check when we last recorded this issue
      const lastLoopDetection = localStorage.getItem('loopDetectionTime');
      const now = new Date().getTime();
      
      // Only show message once per hour
      if (!lastLoopDetection || (now - parseInt(lastLoopDetection) > 60 * 60 * 1000)) {
        console.warn("Detected potential refresh loop. Limiting refreshes to conserve resources.");
        toast.warning("Content refresh temporarily limited", {
          description: "We'll try again later",
          duration: 3000
        });
        localStorage.setItem('loopDetectionTime', now.toString());
      }
      
      // Don't trigger any more refreshes in this session
      setHasAttemptedRefresh(true);
    }
  }, [fetchAttempts]);

  // Actively trigger a refresh on first mount if needed
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
  
  return (
    <div>
      {/* Component to handle automatic refresh of stale content */}
      <AutoRefreshHandler
        videos={displayVideos}
        isRefreshing={isRefreshing}
        lastSuccessfulFetch={lastSuccessfulFetch}
        forceRefetch={forceRefetch}
      />
      
      {/* Responsive video view based on device */}
      {isMobile ? (
        <MobileVideoView
          videos={displayVideos}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          refetch={handleRefetch}
          forceRefetch={handleForceRefetch}
          lastSuccessfulFetch={lastSuccessfulFetch}
          fetchAttempts={fetchAttempts || 0}
        />
      ) : (
        <DesktopVideoView
          videos={displayVideos}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          refetch={handleRefetch}
          forceRefetch={handleForceRefetch}
          lastSuccessfulFetch={lastSuccessfulFetch}
          fetchAttempts={fetchAttempts || 0}
        />
      )}
    </div>
  );
};
