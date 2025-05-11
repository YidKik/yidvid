
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoGridLoader } from "@/components/video/VideoGridLoader";
import { VideoGridItem } from "@/components/video/VideoGridItem";
import { VideoGridError } from "@/components/video/VideoGridError";
import { useVideoGridData, VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";
import { useSessionManager } from "@/hooks/useSessionManager";

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
  const { videos: fetchedVideos, loading: internalLoading, error } = useVideoGridData(maxVideos, !!session);
  
  // Use external videos if provided, otherwise use fetched videos
  const videos = externalVideos || fetchedVideos;
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;

  // Show loader while loading
  if (isLoading) {
    return <VideoGridLoader />;
  }

  // Handle errors
  if (error && !videos.length) {
    return <VideoGridError message={error.message} onRetry={() => window.location.reload()} />;
  }

  // Create grid columns based on device and rowSize
  let gridCols = "grid-cols-4"; // Default desktop
  
  if (isMobile) {
    gridCols = "grid-cols-2"; // Mobile always 2 columns
  } else if (isTablet) {
    gridCols = "grid-cols-3"; // Tablet always 3 columns
  }
  
  const gridGap = isMobile ? "gap-x-2 gap-y-1" : "gap-4";
  
  // Limit videos based on device
  const videoLimit = isMobile ? 4 : isTablet ? 9 : maxVideos;
  const displayVideos = videos.slice(0, videoLimit);

  return (
    <div className={cn("grid video-grid-container", gridCols, gridGap, className)}>
      {displayVideos.map((video) => (
        <VideoGridItem key={video.id} video={video} />
      ))}
    </div>
  );
};

export default VideoGrid;
