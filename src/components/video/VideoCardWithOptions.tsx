import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { VideoOptionsMenu } from "./VideoOptionsMenu";
import { cn } from "@/lib/utils";
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
      className={cn("relative group", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Link
        to={`/video/${videoId}`}
        className="block"
      >
        {/* Thumbnail with hover effects */}
        <div className={`relative aspect-video ${isMobile ? 'rounded-lg' : isTablet ? 'rounded-xl' : 'rounded-xl'} overflow-hidden border-2 border-transparent group-hover:border-[#FFCC00] transition-all duration-300`}>
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
                <div className={`bg-[#1A1A1A] rounded-full ${isMobile ? 'px-1.5 py-0.5' : 'px-2.5 py-1'} flex items-center gap-1 shadow-lg`}>
                  <Clock size={isMobile ? 9 : 11} className="text-white" />
                  <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-semibold text-white`}>{duration}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Video Info */}
        <div className={isMobile ? 'mt-1.5' : 'mt-3'}>
          <h3 className={`${isMobile ? 'text-[11px] leading-tight' : 'text-sm'} font-semibold font-friendly text-foreground line-clamp-2 leading-snug`}>
            {title}
          </h3>
          {!hideChannelInfo && (
            <div className={`flex items-center gap-1.5 ${isMobile ? 'mt-0.5' : 'mt-2'}`}>
              <div className={`${isMobile ? 'w-3.5 h-3.5' : 'w-6 h-6'} rounded-full overflow-hidden flex-shrink-0 bg-muted`}>
                {channelThumbnail ? (
                  <img
                    src={channelThumbnail}
                    alt={channelName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full bg-[#FF0000] flex items-center justify-center ${isMobile ? 'text-[7px]' : 'text-[10px]'} font-bold text-white`}>
                    {channelName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <p className={`${isMobile ? 'text-[9px]' : 'text-xs'} text-muted-foreground truncate`}>
                {channelName}
              </p>
            </div>
          )}
          <p className={`${isMobile ? 'text-[9px] mt-0' : 'text-xs mt-1.5'} text-muted-foreground/80`}>
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