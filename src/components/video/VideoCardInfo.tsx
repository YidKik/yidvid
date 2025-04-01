
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
  
  // Format views count
  const formatViews = (count: number | null | undefined) => {
    if (count === null || count === undefined) return "0 views";
    if (count < 1000) return `${count} views`;
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K views`;
    return `${(count / 1000000).toFixed(1)}M views`;
  };

  return (
    <div className="mt-2 flex items-start space-x-2">
      {/* Channel avatar */}
      {channelThumbnail && (
        <Link 
          to={`/channel/${channelId}`}
          className="flex-shrink-0 mt-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-8 w-8 overflow-hidden rounded-full">
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
      )}
      
      <div className="flex-1 min-w-0">
        <h3 
          className={cn(
            "font-medium text-foreground line-clamp-2", 
            isMobile ? "text-sm" : "text-base"
          )}
        >
          {title}
        </h3>
        
        <div className="mt-1 flex flex-col text-xs text-muted-foreground">
          {!hideChannelName && (
            <Link 
              to={`/channel/${channelId}`}
              className="hover:text-foreground hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {channelName}
            </Link>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span>{formatViews(views)}</span>
            <span className="hidden sm:inline mx-1">•</span>
            <span className="font-medium text-xs">Uploaded {formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
