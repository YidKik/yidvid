
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
  const { isMobile, isTablet } = useIsMobile();
  const { 
    isRefreshing, 
    handleRefetch, 
    handleForceRefetch 
  } = useRefetchControl({ refetch, forceRefetch });
  
  const { 
    createSampleVideos,
    hasOnlySampleVideos 
  } = useSampleVideos();

  // Delay the background refresh to prioritize showing UI first
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);

  // Handle automatic cache clearing for failed fetches
  useEffect(() => {
    if (fetchAttempts && fetchAttempts > 2 && hasOnlySampleVideos(videos) && !isRefreshing && forceRefetch) {
      console.log(`Multiple fetch attempts (${fetchAttempts}) with only sample videos. Auto-clearing cache...`);
      (async () => {
        try {
          await clearApplicationCache();
          console.log("Cache cleared due to multiple failed fetches");
          
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
    }
  }, [fetchAttempts, videos, hasOnlySampleVideos, isRefreshing, forceRefetch]);

  // Actively trigger a refresh after component mount if we have no real videos
  const triggerContentRefresh = useCallback(() => {
    if (forceRefetch && !isRefreshing) {
      setHasAttemptedRefresh(true);
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
    }
  }, [forceRefetch, isRefreshing, fetchAttempts]);

  // If we have only sample videos, try to refresh real content ASAP
  useEffect(() => {
    if (!isLoading && !isRefreshing && hasOnlySampleVideos(videos) && !hasAttemptedRefresh) {
      console.log("Detected sample-only videos, scheduling refresh");
      
      // Quick timeout to let UI render first
      const timer = setTimeout(() => {
        triggerContentRefresh();
      }, 500); // Reduced time for faster content loading
      
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
  console.log(`Device type: isMobile=${isMobile}, isTablet=${isTablet}`);

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
          isTablet={isTablet}
        />
      )}
    </div>
  );
};
