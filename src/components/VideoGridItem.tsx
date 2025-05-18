
import { Link } from "react-router-dom";
import { VideoCardSkeleton } from "./video/VideoCardSkeleton";
import { VideoCardThumbnail } from "./video/VideoCardThumbnail";
import { VideoCardInfo } from "./video/VideoCardInfo";
import { useLocation } from "react-router-dom";
import { VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";
import { useVideoDate } from "./video/useVideoDate";

interface VideoGridItemProps {
  video: VideoItemType;
  loading?: boolean;
}

export const VideoGridItem = ({ video, loading }: VideoGridItemProps) => {
  const location = useLocation();
  const isVideosPage = location.pathname === "/videos";
  const { getFormattedDate } = useVideoDate();

  if (loading) {
    return <VideoCardSkeleton />;
  }

  // Format the date properly to avoid type mismatch
  const formattedDate = getFormattedDate(video.uploadedAt);
  
  // Make sure we have a valid video_id for the link
  const videoIdForLink = video.video_id || video.id;

  // Ensure we have a valid channelId for the link
  const channelIdForLink = video.channelId || "";

  return (
    <Link 
      to={`/video/${videoIdForLink}`}
      className="group block w-full"
      onClick={() => console.log("Video link clicked:", videoIdForLink)}
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
};
