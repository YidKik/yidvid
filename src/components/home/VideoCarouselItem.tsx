
import React from "react";
import { VideoGridItem as VideoGridItemType } from "@/hooks/video/useVideoGridData";
import { VideoGridItem } from "@/components/video/VideoGridItem";
import { useIsMobile } from "@/hooks/use-mobile";

interface VideoCarouselItemProps {
  video: VideoGridItemType;
  onClick: (videoId: string) => void;
}

export const VideoCarouselItem = ({ video, onClick }: VideoCarouselItemProps) => {
  const { isMobile } = useIsMobile();

  return (
    <div
      className="flex-none"
      style={{ 
        flex: `0 0 ${isMobile ? "70%" : "25%"}`, 
        aspectRatio: "16/9",
        cursor: "pointer" 
      }}
      onClick={() => onClick(video.video_id)}
    >
      <VideoGridItem video={video} />
    </div>
  );
};
