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
        <div className={`relative aspect-video rounded-xl overflow-hidden border-2 border-transparent group-hover:border-[#FFCC00] transition-all duration-300`}>
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
        
        {/* Video Info - scales with viewport */}
        <div className={isMobile ? 'mt-1' : 'mt-1 sm:mt-1.5 md:mt-2 lg:mt-3'}>
          <h3 className={`${
            isMobile ? 'text-[10px] leading-tight min-h-[24px]' 
            : 'text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-sm min-h-[24px] sm:min-h-[28px] md:min-h-[32px] lg:min-h-[38px]'
          } font-semibold font-friendly text-foreground line-clamp-2 leading-snug`}>
            {title}
          </h3>
          {!hideChannelInfo && (
            <div className={`flex items-center gap-1 min-h-[14px] ${isMobile ? 'mt-0.5' : 'mt-0.5 sm:mt-1 lg:mt-1.5 xl:mt-2'}`}>
              <div className={`${isMobile ? 'w-3 h-3' : 'w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6'} rounded-full overflow-hidden flex-shrink-0 bg-muted`}>
                {channelThumbnail ? (
                  <img
                    src={channelThumbnail}
                    alt={channelName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full bg-[#FF0000] flex items-center justify-center ${isMobile ? 'text-[6px]' : 'text-[6px] sm:text-[7px] md:text-[8px] lg:text-[9px] xl:text-[10px]'} font-bold text-white`}>
                    {channelName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <p className={`${isMobile ? 'text-[8px]' : 'text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-xs'} text-muted-foreground truncate`}>
                {channelName}
              </p>
            </div>
          )}
          <p className={`${
            isMobile ? 'text-[8px] mt-0 min-h-[10px]' 
            : 'text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-xs mt-0 sm:mt-0.5 lg:mt-1 xl:mt-1.5 min-h-[10px] sm:min-h-[12px] md:min-h-[14px] lg:min-h-[16px]'
          } text-muted-foreground/80`}>
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