
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoGridLoader } from "@/components/video/VideoGridLoader";
import { VideoGridItem } from "@/components/video/VideoGridItem";
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
  const { videos: fetchedVideos, loading: internalLoading } = useVideoGridData(maxVideos);
  
  // Use external videos if provided, otherwise use fetched videos
  const videos = externalVideos || fetchedVideos;
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;

  // On main page, use a simpler loading indicator
  if (isLoading) {
    return <VideoGridLoader />;
  }

  return (
    <div
      className={cn(
        "grid",
        isMobile ? "grid-cols-2 gap-x-2 gap-y-3" : `grid-cols-${rowSize} gap-4`,
        className
      )}
    >
      {videos.map((video) => (
        <VideoGridItem key={video.id} video={video} />
      ))}
    </div>
  );
};

export default VideoGrid;
