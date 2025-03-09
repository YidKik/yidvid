
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoCard } from "./VideoCard";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();
  const isMainPage = location.pathname === "/";
  
  // Check if we're really loading or have no videos
  const loading = isLoading || !videos || videos.length === 0;
  const displayVideos = videos?.slice(0, maxVideos) || [];
  
  // Log for debugging
  useEffect(() => {
    console.log(`VideoGrid rendering with ${displayVideos.length} videos, isLoading: ${isLoading}`);
    if (displayVideos.length > 0) {
      console.log("First video sample title:", displayVideos[0].title);
    } else if (!isLoading) {
      console.warn("VideoGrid has no videos to display");
    }
  }, [displayVideos, isLoading]);
  
  // Dynamically determine grid columns based on rowSize and mobile status
  const gridCols = isMobile ? "grid-cols-2" : `grid-cols-${rowSize}`;
  
  // Better check for real videos vs sample videos
  const hasRealVideos = displayVideos.some(v => 
    !v.id.toString().includes('sample') && 
    !v.video_id.includes('sample') &&
    v.channelName !== "Sample Channel" &&
    v.title !== "Sample Video 1"
  );
  
  // Create sample videos as fallback if needed
  const createSampleVideos = () => {
    const now = new Date();
    return Array(maxVideos).fill(null).map((_, i) => ({
      id: `sample-${i}`,
      video_id: `sample-vid-${i}`,
      title: `Sample Video ${i+1}`,
      thumbnail: '/placeholder.svg',
      channelName: "Sample Channel",
      channelId: "sample-channel",
      views: 1000 * (i+1),
      uploadedAt: new Date(now.getTime() - (i * 86400000))
    }));
  };

  if (loading && !isMainPage) {
    return (
      <div className={cn(
        "flex items-center justify-center",
        isMobile ? "min-h-[200px]" : "min-h-[400px]"
      )}>
        <LoadingAnimation
          size={isMobile ? "small" : "medium"}
          color="primary"
          text="Loading videos..."
        />
      </div>
    );
  }

  // If on main page and loading, just render an empty div with appropriate height
  if (loading && isMainPage) {
    return (
      <div className={cn(
        "flex items-center justify-center",
        isMobile ? "min-h-[200px]" : "min-h-[400px]"
      )}></div>
    );
  }

  // Use real videos if we have them, otherwise use sample videos
  const videosToDisplay = hasRealVideos ? displayVideos : createSampleVideos();

  return (
    <div className={cn(
      "grid",
      isMobile ? "grid-cols-2 gap-x-2 gap-y-3" : `grid-cols-${rowSize} gap-4`,
      className
    )}>
      {videosToDisplay.map((video) => (
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
