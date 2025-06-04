
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { VideoCardSkeleton } from "./video/VideoCardSkeleton";
import { VideoCardThumbnail } from "./video/VideoCardThumbnail";
import { VideoCardInfo } from "./video/VideoCardInfo";
import { useVideoDate } from "./video/useVideoDate";
import { useIsMobile } from "@/hooks/use-mobile";

interface VideoCardProps {
  id: string;
  video_id?: string;
  uuid?: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
  views?: number | null;
  uploadedAt: string | Date;
  channelThumbnail?: string;
  hideInfo?: boolean;
  hideChannelName?: boolean;
  className?: string;
  isLazy?: boolean;
}

export const VideoCard = ({
  id,
  video_id,
  uuid,
  title,
  thumbnail,
  channelName,
  channelId,
  views,
  uploadedAt,
  channelThumbnail,
  hideInfo = false,
  hideChannelName = false,
  className,
  isLazy = false
}: VideoCardProps) => {
  const [isLoaded, setIsLoaded] = useState(!isLazy);
  const { getFormattedDate } = useVideoDate();
  const { isMobile } = useIsMobile();
  
  // When isLazy changes (e.g., when the component becomes visible), update the loaded state
  useEffect(() => {
    if (!isLazy && !isLoaded) {
      setIsLoaded(true);
    }
  }, [isLazy, isLoaded]);
  
  // If this component should be lazy loaded and hasn't been triggered yet, render a placeholder
  if (isLazy && !isLoaded) {
    return <VideoCardSkeleton hideInfo={hideInfo} className={cn("block w-full cursor-pointer", className)} />;
  }
  
  // Determine the correct ID to use for navigation - prioritize video_id over id
  const videoIdForLink = video_id || id;
  
  // Format the date
  const formattedDate = getFormattedDate(uploadedAt);

  // Check if this is a placeholder or sample
  const isSample = id?.toString().includes('sample') || video_id?.includes('sample');

  // Convert views to a number if it's not already
  const viewsNumber = typeof views === 'number' ? views : Number(views) || 0;

  return (
    <Link 
      to={`/video/${videoIdForLink}`} 
      className={cn(
        "block w-full cursor-pointer group",
        isMobile ? "transform-none" : "",
        className
      )}
      aria-label={`Watch ${title}`}
    >
      <VideoCardThumbnail 
        thumbnail={thumbnail} 
        title={title} 
        isSample={isSample} 
      />
      
      {!hideInfo && (
        <VideoCardInfo
          title={title}
          channelName={channelName}
          channelId={channelId}
          views={viewsNumber}
          formattedDate={formattedDate}
          channelThumbnail={channelThumbnail}
          hideChannelName={hideChannelName}
        />
      )}
    </Link>
  );
};
