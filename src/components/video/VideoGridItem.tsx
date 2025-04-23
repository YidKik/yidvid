
import { Link } from "react-router-dom";
import { VideoCardSkeleton } from "./VideoCardSkeleton";
import { VideoCardThumbnail } from "./VideoCardThumbnail";
import { VideoCardInfo } from "./VideoCardInfo";
import { useLocation } from "react-router-dom";
import { VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";
import { useVideoDate } from "./useVideoDate";

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
  
  // Make sure we have a valid ID for linking - prioritize video_id over id
  // video_id is the YouTube's video ID, which is what our VideoPlayer expects
  const videoIdForLink = video.video_id || video.id;
  
  // Add debug log to help troubleshoot routing issues
  console.log("VideoGridItem linking to video with ID:", videoIdForLink);

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
          channelId={video.channelId}
          views={video.views}
          formattedDate={formattedDate}
          channelThumbnail={video.channelThumbnail}
        />
      )}
    </Link>
  );
};
