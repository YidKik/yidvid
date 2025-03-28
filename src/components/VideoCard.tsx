
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
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
  className?: string;
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
  className
}: VideoCardProps) => {
  const { isMobile } = useIsMobile();
  
  // Determine the correct ID to use for navigation
  const videoIdForLink = video_id || id;
  
  // Format the upload date
  const formattedDate = typeof uploadedAt === "string" 
    ? formatDistanceToNow(new Date(uploadedAt), { addSuffix: true })
    : formatDistanceToNow(uploadedAt, { addSuffix: true });
  
  // Format views count
  const formatViews = (count: number | null | undefined) => {
    if (count === null || count === undefined) return "0 views";
    if (count < 1000) return `${count} views`;
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K views`;
    return `${(count / 1000000).toFixed(1)}M views`;
  };

  return (
    <Link 
      to={`/video/${videoIdForLink}`} 
      className={cn(
        "block w-full cursor-pointer",
        className
      )}
      aria-label={`Watch ${title}`}
    >
      <div className="relative w-full overflow-hidden rounded-lg bg-muted/30">
        {/* Thumbnail */}
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={thumbnail || "/placeholder.svg"}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105 thumbnail-slide-up"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
        </div>
        
        {/* Video duration badge - if implemented */}
        {/* <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1 py-0.5 text-xs text-white">
          {duration}
        </div> */}
      </div>
      
      {!hideInfo && (
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
                    target.src = "/placeholder.svg";
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
              <Link 
                to={`/channel/${channelId}`}
                className="hover:text-foreground hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {channelName}
              </Link>
              
              <div className="flex items-center">
                <span>{formatViews(views)}</span>
                <span className="mx-1">•</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
};
