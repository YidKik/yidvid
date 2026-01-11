import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Clock } from "lucide-react";

interface VideoCardThumbnailProps {
  thumbnail: string;
  title: string;
  isSample?: boolean;
  views?: number;
  formattedDate?: string;
  channelName?: string;
  duration?: string;
  showChannelOnHover?: boolean;
}

export const VideoCardThumbnail = ({
  thumbnail,
  title,
  isSample = false,
  views,
  formattedDate,
  channelName,
  duration,
  showChannelOnHover = false
}: VideoCardThumbnailProps) => {
  const [imageError, setImageError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const { isMobile } = useIsMobile();
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    
    // Reset any animation timeouts when mouse leaves
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden aspect-video w-full group video-card-thumbnail",
        "rounded-xl transition-all duration-300",
        "border-2 border-gray-200/50 bg-gray-50"
      )}
      style={{
        borderColor: isHovering ? 'hsl(50, 100%, 50%)' : undefined
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main thumbnail image */}
      <img
        src={imageError ? "/placeholder.svg" : thumbnail}
        alt={title}
        loading="lazy"
        className="w-full h-full object-cover transition-all duration-300 ease-out rounded-xl"
        onError={() => setImageError(true)}
      />
      
      {/* Hover overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 transition-opacity duration-300 rounded-xl",
          isHovering ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Top right - duration */}
        <div className="absolute top-0 right-0 p-2.5">
          {duration && (
            <div 
              className="bg-black/70 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-lg"
              style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
            >
              <Clock size={11} className="text-white" />
              <span className="text-xs font-semibold text-white">{duration}</span>
            </div>
          )}
        </div>
        
        {/* Bottom left - channel name (only on videos page) */}
        {showChannelOnHover && channelName && (
          <div className="absolute bottom-0 left-0 right-0 p-2.5">
            <div 
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-500/90 to-yellow-500/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg max-w-[85%]"
              style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
            >
              <span className="text-xs font-bold text-white truncate">{channelName}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};