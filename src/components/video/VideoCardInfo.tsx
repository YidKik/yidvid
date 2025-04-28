
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface VideoCardInfoProps {
  title: string;
  channelName: string;
  channelId: string;
  views?: number | null;
  formattedDate: string;
  channelThumbnail?: string;
  hideChannelName?: boolean;
}

export const VideoCardInfo = ({
  title,
  channelName,
  channelId,
  views,
  formattedDate,
  channelThumbnail,
  hideChannelName = false
}: VideoCardInfoProps) => {
  const { isMobile } = useIsMobile();
  
  // Format views count with improved handling
  const formatViews = (count: number | null | undefined) => {
    // Check if we have a valid number greater than 0
    if (count === null || count === undefined || isNaN(Number(count))) {
      return "No views yet";
    }
    
    const viewCount = Number(count);
    
    // Format numbers appropriately
    if (viewCount === 0) return "No views yet";
    if (viewCount === 1) return "1 view";
    if (viewCount < 1000) return `${viewCount} views`;
    if (viewCount < 1000000) return `${(viewCount / 1000).toFixed(1)}K views`;
    return `${(viewCount / 1000000).toFixed(1)}M views`;
  };

  // Only create channel link if we have a valid channel ID
  const hasValidChannelId = !!channelId && channelId.trim() !== "";

  return (
    <div className="mt-2 flex items-start space-x-2">
      {/* Channel avatar - wrap in Link only if valid channel ID exists */}
      {channelThumbnail && (
        <>
          {hasValidChannelId ? (
            <Link 
              to={`/channel/${channelId}`} 
              className="flex-shrink-0 mt-0.5"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering parent link
                console.log("Navigating to channel:", channelId);
              }}
            >
              <div className="h-6 w-6 overflow-hidden rounded-full">
                <img
                  src={channelThumbnail}
                  alt={channelName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/lovable-uploads/efca5adc-d9d2-4c5b-8900-e078f9d49b6a.png";
                  }}
                />
              </div>
            </Link>
          ) : (
            <span className="flex-shrink-0 mt-0.5">
              <div className="h-6 w-6 overflow-hidden rounded-full">
                <img
                  src={channelThumbnail}
                  alt={channelName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/lovable-uploads/efca5adc-d9d2-4c5b-8900-e078f9d49b6a.png";
                  }}
                />
              </div>
            </span>
          )}
        </>
      )}
      
      <div className="flex-1 min-w-0">
        <h3 
          className={cn(
            "video-title line-clamp-2 group-hover:text-primary transition-colors duration-200", 
            isMobile ? "text-sm" : "text-youtube-title"
          )}
        >
          {title}
        </h3>
        
        <div className="mt-1 flex flex-col text-xs video-meta-text">
          {!hideChannelName && (
            <>
              {hasValidChannelId ? (
                <Link 
                  to={`/channel/${channelId}`}
                  className="video-channel-name hover:underline"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering parent link
                    console.log("Channel name clicked:", channelId);
                  }}
                >
                  {channelName}
                </Link>
              ) : (
                <span className="video-channel-name">{channelName}</span>
              )}
            </>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span>{formatViews(views)}</span>
            <span className="hidden sm:inline mx-1 text-youtube-small">•</span>
            <span className="text-youtube-small">{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
