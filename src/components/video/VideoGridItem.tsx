
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
  // video_id is the YouTube's video ID, which is what our routing expects
  const videoIdForLink = video.video_id || video.id;
  
  // Always ensure we have a valid channelId for linking to the channel page
  const channelIdForLink = video.channelId || "";
  
  // Only create channel link if we have a valid channel ID
  const hasValidChannelId = !!channelIdForLink && channelIdForLink.trim() !== "";
  
  // Handle sample videos differently - they should still be clickable but with a special flag
  const isSampleVideo = video.id?.toString().includes('sample') || 
                        video.video_id?.includes('sample') || 
                        video.channelName === "Sample Channel";

  return (
    <Link 
      to={`/video/${videoIdForLink}`}
      className={`group block w-full ${isSampleVideo ? 'opacity-80 hover:opacity-100' : ''}`}
      state={{ isSampleVideo }}
    >
      <VideoCardThumbnail 
        thumbnail={video.thumbnail} 
        title={video.title} 
        isSample={isSampleVideo} 
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
