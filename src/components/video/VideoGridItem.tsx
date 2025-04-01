
import { cn } from "@/lib/utils";
import { VideoCard } from "@/components/VideoCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";

interface VideoGridItemProps {
  video: VideoItemType;
}

export const VideoGridItem = ({ video }: VideoGridItemProps) => {
  const { isMobile } = useIsMobile();
  
  return (
    <div
      key={video.id || `video-${Math.random()}`}
      className={cn("w-full flex flex-col", isMobile && "mb-2")}
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
        channelThumbnail={video.channelThumbnail}
      />
    </div>
  );
};
