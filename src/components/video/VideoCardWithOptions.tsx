import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { VideoOptionsMenu } from "./VideoOptionsMenu";
import { cn } from "@/lib/utils";

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
}: VideoCardWithOptionsProps) => {
  const [isHovering, setIsHovering] = useState(false);

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
        <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-transparent group-hover:border-[#FFCC00] transition-all duration-300">
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
                <div className="bg-black/70 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-lg">
                  <Clock size={11} className="text-white" />
                  <span className="text-xs font-semibold text-white">{duration}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Video Info */}
        <div className="mt-3">
          <h3 className="text-sm font-semibold font-friendly text-foreground line-clamp-2 leading-snug">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-muted">
              {channelThumbnail ? (
                <img
                  src={channelThumbnail}
                  alt={channelName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center text-[10px] font-bold text-white">
                  {channelName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {channelName}
            </p>
          </div>
          <p className="text-xs text-muted-foreground/80 mt-1.5">
            {views?.toLocaleString() || 0} views • {formattedDate}
          </p>
        </div>
      </Link>
      
      {/* 3-dot options menu - positioned outside the Link to prevent navigation */}
      <div 
        className={cn(
          "absolute top-2 left-2 transition-opacity duration-300 z-10",
          isHovering ? "opacity-100" : "opacity-0"
        )}
      >
        <VideoOptionsMenu 
          videoId={videoUuid} 
          variant="overlay"
        />
      </div>
    </div>
  );
};
