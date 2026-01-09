
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoGridLoader } from "@/components/video/VideoGridLoader";
import { VideoGridItem } from "@/components/video/VideoGridItem";
import { VideoGridError } from "@/components/video/VideoGridError";
import { useVideoGridData, VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";
import { useSessionManager } from "@/hooks/useSessionManager";
import { useEffect, useState } from "react";

interface VideoGridProps {
  videos?: VideoItemType[];
  maxVideos?: number;
  rowSize?: number;
  isLoading?: boolean;
  className?: string;
}

export const VideoGrid = ({
  videos: externalVideos,
  maxVideos = 12,
  rowSize = 4,
  isLoading: externalLoading,
  className,
}: VideoGridProps) => {
  const { isMobile, isTablet } = useIsMobile();
  const { session } = useSessionManager();
  const [forceFetchPublic, setForceFetchPublic] = useState(false);
  
  const shouldShowContent = true;
  
  const { videos: fetchedVideos, loading: internalLoading, error } = useVideoGridData(
    maxVideos, 
    shouldShowContent
  );
  
  useEffect(() => {
    if (!session) {
      setForceFetchPublic(true);
    }
  }, [session]);
  
  useEffect(() => {
    if (forceFetchPublic && !externalVideos && fetchedVideos.length === 0) {
      const fetchPublicVideos = async () => {
        try {
          const response = await fetch(
            "https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-videos",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              }
            }
          );
          
          if (response.ok) {
            console.log("Successfully fetched public videos via edge function");
          }
        } catch (error) {
          console.error("Error fetching public videos:", error);
        } finally {
          setForceFetchPublic(false);
        }
      };
      
      fetchPublicVideos();
    }
  }, [forceFetchPublic, externalVideos, fetchedVideos]);
  
  const videos = externalVideos || fetchedVideos;
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;

  if (isLoading) {
    return <VideoGridLoader />;
  }

  if (error && !videos.length) {
    return <VideoGridError message={error.message} onRetry={() => window.location.reload()} />;
  }

  // Modern responsive grid columns
  let gridCols = "grid-cols-4";
  if (isMobile) {
    gridCols = "grid-cols-2";
  } else if (isTablet) {
    gridCols = "grid-cols-3";
  }
  
  const videoLimit = isMobile ? 6 : isTablet ? 9 : maxVideos;
  const displayVideos = videos.slice(0, videoLimit);

  return (
    <div className={cn(
      "video-grid-modern", 
      gridCols,
      isTablet && "tablet-video-grid-enforce",
      className
    )}>
      {displayVideos.map((video, index) => (
        <VideoGridItem key={video.id} video={video} />
      ))}
    </div>
  );
};

export default VideoGrid;
