
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoCard } from "./VideoCard";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { useEffect, useMemo } from "react";
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
  const { isMobile, isTablet, isDesktop } = useIsMobile();
  const location = useLocation();
  const isMainPage = location.pathname === "/";
  const isAdminPage = location.pathname.includes('/admin');
  
  // Memoize videos to prevent unnecessary re-renders and ensure uniqueness
  const displayVideos = useMemo(() => {
    // Ensure we have valid videos to display (filter out invalid entries)
    if (!videos || videos.length === 0) {
      return [];
    }
    
    // Ensure all videos have required properties
    const filteredVideos = videos.filter(v => 
      v && v.title && v.video_id && (v.thumbnail || v.id.includes('sample'))
    );
    
    // Ensure videos are unique by video_id to prevent duplication in the UI
    const uniqueVideos = filteredVideos.reduce((acc: Video[], current) => {
      const x = acc.find(item => item.video_id === current.video_id);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
    
    return uniqueVideos.slice(0, maxVideos);
  }, [videos, maxVideos]);
  
  // Check if we're really loading or have no videos
  const loading = isLoading || !videos || videos.length === 0;
  
  // Log for debugging
  useEffect(() => {
    console.log(`VideoGrid rendering with ${displayVideos.length} videos, isLoading: ${isLoading}, isMobile: ${isMobile}, isTablet: ${isTablet}, isDesktop: ${isDesktop}`);
    if (displayVideos.length > 0) {
      console.log("First video sample title:", displayVideos[0].title);
    } else if (!isLoading) {
      console.warn("VideoGrid has no videos to display");
    }
  }, [displayVideos, isLoading, isMobile, isTablet, isDesktop]);
  
  // Dynamically determine grid columns based on screen size and page type
  let gridCols = "";
  if (isMobile) {
    gridCols = "grid-cols-2";
  } else if (isTablet || isAdminPage || window.innerWidth < 1024) {
    // For admin pages or tablet-sized screens
    gridCols = "grid-cols-2 sm:grid-cols-3 md:grid-cols-3";
  } else {
    // Default for regular pages on larger screens - always use 4 columns on desktop
    gridCols = `grid-cols-2 sm:grid-cols-3 md:grid-cols-${rowSize}`;
  }
  
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
      title: `Video sample`,
      thumbnail: '',  // Empty to trigger the placeholder
      channelName: "channel name",
      channelId: "sample-channel",
      views: 1025,
      uploadedAt: new Date(now.getTime() - (i * 86400000))
    }));
  };

  // Always show some content even when loading on main page
  const videosToDisplay = displayVideos.length > 0 
    ? displayVideos 
    : (hasRealVideos ? displayVideos : createSampleVideos());

  // On main page, use a simpler loading indicator
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

  return (
    <div className={cn(
      "grid",
      gridCols,
      isMobile ? "gap-x-2 gap-y-3" : "gap-4",
      className
    )}>
      {videosToDisplay.map((video, index) => (
        <div 
          key={`${video.video_id || video.id}-${index}`}
          className={cn(
            "w-full flex flex-col",
            isMobile && "mb-2"
          )}
        >
          <VideoCard 
            id={video.id}
            video_id={video.video_id}
            title={video.title || "Video sample"}
            thumbnail={video.thumbnail || ""}
            channelName={video.channelName || "channel name"}
            channelId={video.channelId}
            views={video.views || 1025}
            uploadedAt={video.uploadedAt}
          />
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
