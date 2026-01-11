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
  hideChannelOnHover?: boolean;
}

export const VideoCardThumbnail = ({
  thumbnail,
  title,
  isSample = false,
  views,
  formattedDate,
  channelName,
  duration,
  hideChannelOnHover = false
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
      
      {/* Hover overlay - only show duration, not channel name */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent transition-opacity duration-300 rounded-xl",
          isHovering ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Top bar with duration only */}
        <div className="absolute top-0 left-0 right-0 p-2 flex items-center justify-end">
          {/* Duration only - no channel name on hover */}
          {duration && (
            <div 
              className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1"
              style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
            >
              <Clock size={10} className="text-white" />
              <span className="text-[11px] font-semibold text-white">{duration}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};