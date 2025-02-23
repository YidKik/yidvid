
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
  views: number;
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
  const loading = isLoading || !videos;
  const displayVideos = videos?.slice(0, maxVideos);

  return (
    <div className={cn(
      "grid",
      isMobile ? "grid-cols-2 gap-x-2 gap-y-0" : `grid-cols-${rowSize} gap-4`,
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
            key={video.id}
            className={cn(
              "w-full flex flex-col",
              isMobile && "mb-1"
            )}
          >
            <VideoCard {...video} />
          </div>
        ))
      )}
    </div>
  );
};

export default VideoGrid;
