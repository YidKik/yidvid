
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useCallback } from "react";
import { MobileVideoView } from "./MobileVideoView";
import { DesktopVideoView } from "./DesktopVideoView";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useRefetchControl } from "@/hooks/video/useRefetchControl";
import { useSampleVideos } from "@/hooks/video/useSampleVideos";
import { AutoRefreshHandler } from "./AutoRefreshHandler";
import { VideoEmptyState } from "./VideoEmptyState";
import { clearApplicationCache } from "@/lib/query-client";

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

  // Track if we've already attempted background refresh
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);
  
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
        localStorage.setItem('loopDetectionTime', now.toString());
      }
      
      // Don't trigger any more refreshes in this session
      setHasAttemptedRefresh(true);
    }
  }, [fetchAttempts]);

  // Handle automatic cache clearing for failed fetches - with rate limiting
  useEffect(() => {
    if (fetchAttempts && fetchAttempts > 2 && hasOnlySampleVideos(videos) && !isRefreshing && forceRefetch && !hasAttemptedRefresh) {
      // Check refresh rate limits
      const lastCacheClear = localStorage.getItem('lastContentCacheClear');
      const now = new Date().getTime();
      
      // Limit to once every 5 minutes
      if (!lastCacheClear || (now - parseInt(lastCacheClear) > 5 * 60 * 1000)) {
        console.log(`Multiple fetch attempts (${fetchAttempts}) with only sample videos. Auto-clearing cache...`);
        setHasAttemptedRefresh(true);
        
        (async () => {
          try {
            await clearApplicationCache();
            console.log("Cache cleared due to multiple failed fetches");
            localStorage.setItem('lastContentCacheClear', now.toString());
            
            // Give a moment before trying to refresh
            setTimeout(() => {
              forceRefetch().catch(error => {
                console.error("Failed to refresh after automatic cache clear:", error);
              });
            }, 500);
          } catch (error) {
            console.error("Failed to clear cache automatically:", error);
          }
        })();
      } else {
        console.log("Skipping cache clear due to rate limiting");
      }
    }
  }, [fetchAttempts, videos, hasOnlySampleVideos, isRefreshing, forceRefetch, hasAttemptedRefresh]);

  // Actively trigger a refresh after component mount if we have no real videos - with rate limiting
  const triggerContentRefresh = useCallback(() => {
    if (forceRefetch && !isRefreshing && !hasAttemptedRefresh) {
      // Check refresh rate limits
      const lastInitialRefresh = localStorage.getItem('lastInitialRefresh');
      const now = new Date().getTime();
      
      // Limit to once every 2 minutes
      if (!lastInitialRefresh || (now - parseInt(lastInitialRefresh) > 2 * 60 * 1000)) {
        setHasAttemptedRefresh(true);
        localStorage.setItem('lastInitialRefresh', now.toString());
        console.log("Triggering content refresh due to sample-only videos");
        
        // Check if we need to clear cache before refreshing
        if (fetchAttempts && fetchAttempts > 1) {
          console.log("Multiple fetch attempts detected, clearing cache before refresh");
          (async () => {
            await clearApplicationCache();
            // Short delay to allow cache clearing to complete
            setTimeout(() => {
              forceRefetch().catch(err => {
                console.error("Error in force refresh after cache clear:", err);
              });
            }, 300);
          })();
        } else {
          // Immediate refresh for better user experience
          forceRefetch().catch(err => {
            console.error("Error in force refresh:", err);
          });
        }
      } else {
        console.log("Skipping initial refresh due to rate limiting");
      }
    }
  }, [forceRefetch, isRefreshing, fetchAttempts, hasAttemptedRefresh]);

  // If we have only sample videos, try to refresh real content - with rate limiting
  useEffect(() => {
    if (!isLoading && !isRefreshing && hasOnlySampleVideos(videos) && !hasAttemptedRefresh) {
      console.log("Detected sample-only videos, scheduling refresh");
      
      // Quick timeout to let UI render first
      const timer = setTimeout(() => {
        triggerContentRefresh();
      }, 1000); // Increased time for better user experience
      
      return () => clearTimeout(timer);
    }
  }, [videos, isLoading, isRefreshing, hasOnlySampleVideos, hasAttemptedRefresh, triggerContentRefresh]);

  // Always show some content immediately - prioritize UI rendering speed
  // Use limited sample videos if we absolutely have no real data
  const displayVideos = videos?.length ? videos : createSampleVideos(8);
  
  // Only show empty state if explicitly requested
  const showEmptyState = false;

  if (showEmptyState && (!videos || videos.length === 0) && !isLoading) {
    return (
      <VideoEmptyState 
        onRefresh={handleForceRefetch}
        isRefreshing={isRefreshing}
      />
    );
  }

  // Log the device type for debugging
  console.log(`Device type: isMobile=${isMobile}`);

  return (
    <div>
      {/* Component to handle automatic refresh of stale content - with rate limiting */}
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
