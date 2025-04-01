
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoGridLoader } from "@/components/video/VideoGridLoader";
import { VideoGridItem } from "@/components/video/VideoGridItem";
import { VideoGridError } from "@/components/video/VideoGridError";
import { useVideoGridData, VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";

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
  const { isMobile } = useIsMobile();
  const { videos: fetchedVideos, loading: internalLoading, error } = useVideoGridData(maxVideos);
  
  // Use external videos if provided, otherwise use fetched videos
  const videos = externalVideos || fetchedVideos;
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;

  // On main page, use a simpler loading indicator
  if (isLoading) {
    return <VideoGridLoader />;
  }

  // Handle errors
  if (error && !videos.length) {
    return <VideoGridError message={error.message} onRetry={() => window.location.reload()} />;
  }

  // Create grid columns based on device and rowSize
  const gridCols = isMobile ? "grid-cols-2" : `grid-cols-${rowSize}`;
  const gridGap = isMobile ? "gap-x-2 gap-y-3" : "gap-4";

  return (
    <div className={cn("grid", gridCols, gridGap, className)}>
      {videos.map((video) => (
        <VideoGridItem key={video.id} video={video} />
      ))}
    </div>
  );
};

export default VideoGrid;
