
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

  // State to track if we've already attempted a refresh
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);

  // Log data for debugging - using shorter format
  useEffect(() => {
    const isEmpty = !videos || videos.length === 0;
    const hasSampleOnly = hasOnlySampleVideos(videos);
    
    if (isEmpty && !isLoading) {
      console.log("No videos data available, displaying empty state");
    } else {
      console.log(`Rendering VideoContent with ${videos?.length || 0} videos (sample only: ${hasSampleOnly})`);
      if (videos?.length > 0) {
        const mostRecent = new Date(videos[0].uploadedAt);
        console.log(`Most recent video: ${mostRecent.toLocaleString()}`);
      }
    }
  }, [videos, isLoading, hasOnlySampleVideos]);

  // Automatically try to fetch real content once if we only have sample videos
  useEffect(() => {
    if (!isLoading && !isRefreshing && hasOnlySampleVideos(videos) && !hasAttemptedRefresh && forceRefetch) {
      setHasAttemptedRefresh(true);
      console.log("Only sample videos detected, attempting to fetch real content");
      toast.info("Loading real content...");
      forceRefetch().then(() => {
        toast.success("Content refreshed successfully");
      }).catch(err => {
        console.error("Error force fetching:", err);
        toast.error("Failed to load real content. Using samples for now.");
      });
    }
  }, [videos, isLoading, isRefreshing, hasOnlySampleVideos, hasAttemptedRefresh, forceRefetch]);

  // Only use sample videos if we absolutely have no real data
  const displayVideos = videos?.length ? videos : createSampleVideos();
  
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
