import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { VideoOptionsMenu } from "./VideoOptionsMenu";
import { cn, cleanVideoTitle } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface VideoCardWithOptionsProps {
  videoId: string;
  videoUuid: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelThumbnail?: string | null;
  views?: number;
  formattedDate: string;
  duration?: string | null;
  className?: string;
  isGrid?: boolean;
  hideChannelInfo?: boolean;
}

export const VideoCardWithOptions = ({
  videoId,
  videoUuid,
  title,
  thumbnail,
  channelName,
  channelThumbnail,
  views,
  formattedDate,
  duration,
  className,
  isGrid = false,
  hideChannelInfo = false,
}: VideoCardWithOptionsProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const { isMobile, isTablet } = useIsMobile();

  return (
    <div 
      className={cn("phone-video-card relative group", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Link
        to={`/video/${videoId}`}
        className="block"
      >
        {/* Thumbnail with hover effects */}
        <div className={`relative aspect-video rounded-card overflow-hidden border-2 border-transparent group-hover:border-brand transition-all duration-300`}>
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Hover overlay with duration */}
          <div 
            className={cn(
              "absolute inset-0 transition-opacity duration-300 pointer-events-none",
              isHovering ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Duration badge - bottom right */}
            {duration && (
              <div className="absolute bottom-2 right-2 pointer-events-auto">
                <div className={`bg-[#1A1A1A] rounded-control ${isMobile ? 'px-1.5 py-0.5' : 'px-2.5 py-1'} flex items-center gap-1`}>
                  <Clock size={isMobile ? 9 : 11} className="text-white" />
                  <span className={`${isMobile ? 'text-xs' : 'text-xs'} font-semibold text-white`}>{duration}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Video Info - scales with viewport */}
        <div className={isMobile ? 'mt-1' : 'mt-1 md:mt-1.5 xl:mt-3'}>
          <h3 dir="auto" title={cleanVideoTitle(title)} className="type-card-title text-foreground line-clamp-2 min-h-[44px] md:min-h-[48px]">
            {cleanVideoTitle(title)}
          </h3>
          {!hideChannelInfo && (
            <div className={`flex items-center gap-1 min-h-[14px] ${isMobile ? 'mt-0.5' : 'mt-0.5 md:mt-1 xl:mt-2'}`}>
              <div className={`${isMobile ? 'w-3.5 h-3.5' : 'w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5'} rounded-full overflow-hidden flex-shrink-0 bg-muted`}>
                {channelThumbnail ? (
                  <img
                    src={channelThumbnail}
                    alt={channelName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full bg-primary flex items-center justify-center ${isMobile ? 'text-xs' : 'text-xs lg:text-xs xl:text-xs'} font-bold text-white`}>
                    {channelName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <p className={`type-meta text-muted-foreground truncate`}>
                {channelName}
              </p>
            </div>
          )}
          <p className={`${
            'type-meta mt-0.5'
          } text-muted-foreground`}>
            {views?.toLocaleString() || 0} views • {formattedDate}
          </p>
        </div>
      </Link>
      
      {/* 3-dot options menu - positioned outside the Link to prevent navigation */}
      <div 
        className={cn(
          "absolute top-1 left-1 transition-opacity duration-300 z-10",
          isHovering ? "opacity-100" : "opacity-0"
        )}
      >
        <VideoOptionsMenu 
          videoId={videoUuid} 
          variant="overlay"
          compact={isMobile}
        />
      </div>
    </div>
  );
};