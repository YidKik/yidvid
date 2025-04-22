
import { Link } from "react-router-dom";
import { VideoCardSkeleton } from "./VideoCardSkeleton";
import { VideoCardThumbnail } from "./VideoCardThumbnail";
import { VideoCardInfo } from "./VideoCardInfo";
import { useLocation } from "react-router-dom";
import { VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";

interface VideoGridItemProps {
  video: VideoItemType;
  loading?: boolean;
}

export const VideoGridItem = ({ video, loading }: VideoGridItemProps) => {
  const location = useLocation();
  const isVideosPage = location.pathname === "/videos";

  if (loading) {
    return <VideoCardSkeleton />;
  }

  return (
    <Link 
      to={`/video/${video.video_id}`}
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
          channelId={video.channelId}
          views={video.views}
          formattedDate={video.uploadedAt}
          channelThumbnail={video.channelThumbnail}
        />
      )}
    </Link>
  );
};
