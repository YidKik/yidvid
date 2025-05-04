import { VideoCard } from "@/components/VideoCard";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { useLocation } from "react-router-dom";

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

  // Log video data for debugging
  console.log("ChannelVideos rendering with:", {
    videosCount: videos?.length || 0,
    isLoading,
    isLoadingMore,
    videos: videos
  });

  // Show loading animation while loading
  if (isLoading) {
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

  // This fallback should not be reached due to checks in the parent component
  // but keeping it as a safety measure
  if (!videos || videos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">No videos found for this channel</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {videos.map((video, index) => (
          <div 
            key={video.id || video.video_id || `video-${index}`}
            className="opacity-0"
            style={{ 
              animation: `fadeIn 0.6s ease-out ${0.5 + index * 0.1}s forwards`
            }}
          >
            <VideoCard
              id={video.id}
              video_id={video.video_id || video.id}
              title={video.title || "Untitled Video"}
              thumbnail={video.thumbnail || "/placeholder.svg"}
              channelName={video.channel_name || "Unknown Channel"}
              views={video.views || 0}
              uploadedAt={video.uploaded_at || new Date().toISOString()}
              channelId={video.channel_id || ""}
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
