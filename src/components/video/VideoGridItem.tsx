
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

  // Format the date properly ensuring it's a Date object
  const uploadedDate = video.uploaded_at instanceof Date ? 
    video.uploaded_at : new Date(video.uploaded_at);
  const formattedDate = getFormattedDate(uploadedDate);
  
  // Make sure we have a valid ID for linking - prioritize video_id over id
  // video_id is the YouTube's video ID, which is what our VideoPlayer expects
  const videoIdForLink = video.video_id || video.id;
  
  // Always ensure we have a valid channelId for linking to the channel page
  // Extract from different possible sources, clean it and ensure it's not empty
  const channelIdForLink = video.channel_id || "";

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
          channelName={video.channel_name}
          channelId={channelIdForLink}
          views={video.views}
          formattedDate={formattedDate}
          channelThumbnail={video.channelThumbnail}
          textColor="text-black"
        />
      )}
    </Link>
  );
};
