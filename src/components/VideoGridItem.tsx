
import { Link } from "react-router-dom";
import { VideoCardSkeleton } from "./video/VideoCardSkeleton";
import { VideoCardThumbnail } from "./video/VideoCardThumbnail";
import { VideoCardInfo } from "./video/VideoCardInfo";
import { useLocation } from "react-router-dom";
import { VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";
import { useVideoDate } from "./video/useVideoDate";
import { memo } from "react";

interface VideoGridItemProps {
  video: VideoItemType;
  loading?: boolean;
}

export const VideoGridItem = memo(({ video, loading }: VideoGridItemProps) => {
  const location = useLocation();
  const isVideosPage = location.pathname === "/videos";
  const { getFormattedDate } = useVideoDate();

  if (loading) {
    return <VideoCardSkeleton />;
  }

  // Format the date properly to avoid type mismatch
  const uploadedDate = video.uploadedAt instanceof Date ? 
    video.uploadedAt : new Date(video.uploadedAt);
  const formattedDate = getFormattedDate(uploadedDate);
  
  // Make sure we have a valid ID for linking
  const videoIdForLink = video.video_id || video.id;
  const channelIdForLink = video.channelId || "";

  return (
    <Link 
      to={`/video/${videoIdForLink}`}
      className="group block w-full"
    >
      <VideoCardThumbnail 
        thumbnail={video.thumbnail} 
        title={video.title} 
        isSample={video.id?.toString().includes('sample')} 
      />
      
      {isVideosPage && (
        <VideoCardInfo
          title={video.title}
          channelName={video.channelName}
          channelId={channelIdForLink}
          views={video.views}
          formattedDate={formattedDate}
          channelThumbnail={video.channelThumbnail}
        />
      )}
    </Link>
  );
});
