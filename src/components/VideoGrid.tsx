
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoCard } from "./VideoCard";

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

  return (
    <div className={cn(
      "grid",
      isMobile ? "grid-cols-2 gap-x-2 gap-y-3" : `grid-cols-${rowSize} gap-4`,
      className
    )}>
      {loading ? (
        [...Array(maxVideos)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="w-full aspect-video bg-gray-200 rounded-lg mb-2" />
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-1" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))
      ) : (
        displayVideos.map((video) => (
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
        ))
      )}
    </div>
  );
};

export default VideoGrid;
