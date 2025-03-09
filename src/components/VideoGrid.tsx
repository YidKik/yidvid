import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoCard } from "./VideoCard";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { useEffect } from "react";

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
  
  // Check if we're really loading or have no videos
  const loading = isLoading || !videos || videos.length === 0;
  const displayVideos = videos?.slice(0, maxVideos) || [];
  
  // Log for debugging
  useEffect(() => {
    console.log(`VideoGrid rendering with ${displayVideos.length} videos, isLoading: ${isLoading}`);
    if (displayVideos.length > 0) {
      console.log("First video sample:", displayVideos[0]);
    } else if (!isLoading) {
      console.warn("VideoGrid has no videos to display");
    }
  }, [displayVideos, isLoading]);
  
  // Dynamically determine grid columns based on rowSize and mobile status
  const gridCols = isMobile ? "grid-cols-2" : `grid-cols-${rowSize}`;
  
  // Create sample videos as fallback if needed
  const createSampleVideos = () => {
    const now = new Date();
    return Array(maxVideos).fill(null).map((_, i) => ({
      id: `sample-${i}`,
      video_id: `sample-vid-${i}`,
      title: `Sample Video ${i+1}`,
      thumbnail: '/lovable-uploads/2df6b540-f798-4831-8fcc-255a55486aa0.png',
      channelName: "Sample Channel",
      channelId: "sample-channel",
      views: 1000 * (i+1),
      uploadedAt: new Date(now.getTime() - (i * 86400000))
    }));
  };

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

  // More aggressive check for real videos vs sample videos
  const hasRealVideos = displayVideos.some(v => 
    !v.id.toString().includes('sample') && 
    v.title !== "Sample Video 1" &&
    v.channelName !== "Sample Channel"
  );
  
  // Only use sample videos if we have absolutely no real videos
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
            thumbnail={video.thumbnail || "/lovable-uploads/2df6b540-f798-4831-8fcc-255a55486aa0.png"}
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
