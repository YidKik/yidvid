
import { VideoCard } from "@/components/VideoCard";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

interface ChannelVideosProps {
  videos: any[];
  isLoading: boolean;
  channelThumbnail: string;
  initialCount: number;
  isLoadingMore?: boolean;
}

export const ChannelVideos = ({
  videos,
  isLoading,
  channelThumbnail,
  initialCount,
  isLoadingMore,
}: ChannelVideosProps) => {
  const location = useLocation();
  const isMainPage = location.pathname === "/";

  // Get responsive grid classes based on screen width
  const getGridClasses = () => {
    const width = window.innerWidth;
    if (width < 640) return "grid-cols-1 gap-3"; // Mobile
    if (width >= 640 && width < 1024) return "grid-cols-2 gap-4"; // Tablet (unchanged)
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-8"; // Desktop
  };
  
  const [gridClasses, setGridClasses] = useState(getGridClasses());
  
  // Update grid classes on window resize
  useEffect(() => {
    const handleResize = () => {
      setGridClasses(getGridClasses());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading && !isMainPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingAnimation
          size="medium"
          color="primary"
          text="Loading channel videos..."
        />
      </div>
    );
  }

  return (
    <>
      <div className={gridClasses}>
        {videos.map((video, index) => (
          <div 
            key={video.id} 
            className="opacity-0"
            style={{ 
              animation: `fadeIn 0.6s ease-out ${0.5 + index * 0.1}s forwards`
            }}
          >
            <VideoCard
              id={video.video_id}
              uuid={video.id}
              title={video.title}
              thumbnail={video.thumbnail}
              channelName={video.channel_name}
              views={video.views || 0}
              uploadedAt={video.uploaded_at}
              channelId={video.channel_id}
              channelThumbnail={channelThumbnail}
            />
          </div>
        ))}
      </div>
      {isLoadingMore && !isMainPage && (
        <div className="flex justify-center mt-6 md:mt-8">
          <LoadingAnimation size="small" color="muted" />
        </div>
      )}
    </>
  );
};
