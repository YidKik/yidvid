
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoCard } from "./VideoCard";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";

interface Video {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
  views: number | null;
  uploadedAt: string | Date;
}

interface VideoGridProps {
  videos: Video[];
  maxVideos?: number;
  rowSize?: number;
  isLoading?: boolean;
  className?: string;
}

export const VideoGrid = ({
  videos,
  maxVideos = 12,
  rowSize = 4,
  isLoading = false,
  className,
}: VideoGridProps) => {
  const isMobile = useIsMobile();
  const loading = isLoading || !videos || videos.length === 0;
  const displayVideos = videos?.slice(0, maxVideos) || [];
  
  const gridCols = isMobile ? "grid-cols-2" : `grid-cols-${rowSize}`;

  if (loading) {
    return (
      <div className={cn(
        "flex items-center justify-center",
        isMobile ? "min-h-[200px]" : "min-h-[400px]"
      )}>
        <LoadingAnimation
          size={isMobile ? "small" : "medium"}
          color="accent"
          text="Loading videos..."
        />
      </div>
    );
  }

  return (
    <div className={cn(
      "grid",
      isMobile ? "grid-cols-2 gap-x-2 gap-y-3" : `grid-cols-${rowSize} gap-4`,
      className
    )}>
      {displayVideos.map((video) => (
        <div 
          key={video.id || `video-${Math.random()}`}
          className={cn(
            "w-full flex flex-col",
            isMobile && "mb-2"
          )}
        >
          <VideoCard 
            id={video.id}
            video_id={video.video_id}
            title={video.title || "Untitled Video"}
            thumbnail={video.thumbnail || "/placeholder.svg"}
            channelName={video.channelName || "Unknown Channel"}
            channelId={video.channelId}
            views={video.views || 0}
            uploadedAt={video.uploadedAt}
          />
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
