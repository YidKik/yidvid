
import { useIsMobile } from "@/hooks/useIsMobile";
import { useState, useEffect } from "react";
import { MobileVideoView } from "./MobileVideoView";
import { DesktopVideoView } from "./DesktopVideoView";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useRefetchControl } from "@/hooks/video/useRefetchControl";
import { useSampleVideos } from "@/hooks/video/useSampleVideos";
import { AutoRefreshHandler } from "./AutoRefreshHandler";
import { VideoEmptyState } from "./VideoEmptyState";
import { toast } from "sonner";

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
  const isMobile = useIsMobile();
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

  // Schedule background content loading with delay
  useEffect(() => {
    if (!isLoading && !isRefreshing && hasOnlySampleVideos(videos) && !hasAttemptedRefresh && forceRefetch) {
      setHasAttemptedRefresh(true);
      
      // Delay the background refresh to improve perceived performance
      const timer = setTimeout(() => {
        console.log("Starting delayed background refresh for real content");
        forceRefetch().catch(err => {
          console.error("Error in delayed force fetching:", err);
        });
      }, 2500); // Wait longer to fetch real content
      
      return () => clearTimeout(timer);
    }
  }, [videos, isLoading, isRefreshing, hasOnlySampleVideos, hasAttemptedRefresh, forceRefetch]);

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
