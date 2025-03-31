
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoPlaceholder } from "@/components/video/VideoPlaceholder";
import { useEffect, useState } from "react";

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
  className,
  isLazy = false
}: VideoCardProps) => {
  const { isMobile } = useIsMobile();
  const [isLoaded, setIsLoaded] = useState(!isLazy);
  
  // When isLazy changes (e.g., when the component becomes visible), update the loaded state
  useEffect(() => {
    if (!isLazy && !isLoaded) {
      setIsLoaded(true);
    }
  }, [isLazy, isLoaded]);
  
  // If this component should be lazy loaded and hasn't been triggered yet, render a placeholder
  if (isLazy && !isLoaded) {
    return (
      <div className={cn(
        "block w-full cursor-pointer",
        className
      )}>
        <div className="relative w-full overflow-hidden rounded-lg bg-muted/30">
          <div className="aspect-video w-full overflow-hidden">
            <VideoPlaceholder size="small" />
          </div>
        </div>
        
        {!hideInfo && (
          <div className="mt-2 flex items-start space-x-2 animate-pulse">
            <div className="flex-shrink-0 mt-0.5">
              <div className="h-8 w-8 rounded-full bg-muted"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-muted/70 rounded w-1/2 mt-1"></div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Determine the correct ID to use for navigation
  const videoIdForLink = video_id || id;
  
  // Format the upload date with robust error handling
  const getFormattedDate = () => {
    try {
      if (!uploadedAt) return "recently";
      
      let dateToFormat: Date;
      
      if (typeof uploadedAt === "string") {
        dateToFormat = new Date(uploadedAt);
      } else if (uploadedAt instanceof Date) {
        dateToFormat = uploadedAt;
      } else {
        return "recently"; // Fallback for unexpected types
      }
      
      // Check if the date is valid before formatting
      if (isNaN(dateToFormat.getTime())) {
        console.warn("Invalid date encountered in VideoCard:", uploadedAt);
        return "recently";
      }
      
      return formatDistanceToNow(dateToFormat, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", error, uploadedAt);
      return "recently"; // Fallback for all errors
    }
  };
  
  const formattedDate = getFormattedDate();
  
  // Format views count
  const formatViews = (count: number | null | undefined) => {
    if (count === null || count === undefined) return "0 views";
    if (count < 1000) return `${count} views`;
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K views`;
    return `${(count / 1000000).toFixed(1)}M views`;
  };

  // Check if this is a placeholder or sample
  const isSample = id.includes('sample') || video_id?.includes('sample');

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
          {isSample || !thumbnail ? (
            <VideoPlaceholder size="small" />
          ) : (
            <img
              src={thumbnail}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105 thumbnail-slide-up"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.parentElement!.innerHTML = `
                  <div class="h-full w-full flex items-center justify-center">
                    <img src="/lovable-uploads/efca5adc-d9d2-4c5b-8900-e078f9d49b6a.png" alt="${title}" class="h-32 w-auto" />
                  </div>
                `;
              }}
            />
          )}
        </div>
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
