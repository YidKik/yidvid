
import { Link } from "react-router-dom";
import { VideoCardSkeleton } from "./VideoCardSkeleton";
import { useLocation } from "react-router-dom";
import { VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";
import { useVideoDate } from "./useVideoDate";
import { Play } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface VideoGridItemProps {
  video: VideoItemType;
  loading?: boolean;
}

export const VideoGridItem = ({ video, loading }: VideoGridItemProps) => {
  const location = useLocation();
  const isVideosPage = location.pathname === "/videos";
  const { getFormattedDate } = useVideoDate();
  const [imageError, setImageError] = useState(false);
  const { isMobile } = useIsMobile();

  if (loading) {
    return <VideoCardSkeleton />;
  }

  const uploadedDate = video.uploaded_at instanceof Date ? 
    video.uploaded_at : new Date(video.uploaded_at);
  const formattedDate = getFormattedDate(uploadedDate);
  
  const videoIdForLink = video.video_id || video.id;
  const channelIdForLink = video.channel_id || "";

  // Format view count
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Link 
      to={`/video/${videoIdForLink}`}
      className="video-card-modern block w-full group"
    >
      {/* Modern Thumbnail */}
      <div className="video-thumbnail-modern relative">
        <img
          src={imageError ? "/placeholder.svg" : video.thumbnail}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
        
        {/* Play Button Overlay */}
        <div className="play-overlay">
          <div className="play-button-icon">
            <Play className="w-6 h-6 text-white ml-1" fill="white" />
          </div>
        </div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      {/* Modern Video Info */}
      {isVideosPage && (
        <div className="video-info-modern">
          <h3 className="video-title-modern">
            {video.title}
          </h3>
          
          <div className="flex items-start gap-2">
            {video.channelThumbnail && !isMobile && (
              <img 
                src={video.channelThumbnail} 
                alt={video.channel_name} 
                className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5 ring-2 ring-gray-100" 
                onError={(e) => {
                  e.currentTarget.src = "/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png";
                }}
              />
            )}
            
            <div className="flex flex-col min-w-0">
              {channelIdForLink ? (
                <Link 
                  to={`/channel/${channelIdForLink}`}
                  className="video-channel-modern truncate hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {video.channel_name}
                </Link>
              ) : (
                <span className="video-channel-modern truncate">
                  {video.channel_name}
                </span>
              )}
              
              <div className="video-meta-modern">
                <span>{formatViewCount(video.views)} views</span>
                <span className="dot" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
};
