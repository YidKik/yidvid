
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
}

export const VideoCardThumbnail = ({
  thumbnail,
  title,
  isSample = false,
  views,
  formattedDate,
  channelName,
  duration
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
        "border border-gray-200 hover:border-blue-400 hover:shadow-md",
        "bg-gradient-to-br from-blue-50 to-gray-50"
      )}
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
      
      {/* Hover overlay with channel name and duration */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-300 rounded-xl flex flex-col justify-between p-2",
          isHovering ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Channel name at top */}
        {channelName && (
          <div 
            className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 self-start"
            style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
          >
            <span className="text-xs font-semibold text-gray-800">{channelName}</span>
          </div>
        )}
        
        {/* Duration at bottom right */}
        {duration && (
          <div className="flex justify-end">
            <div 
              className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1"
              style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
            >
              <Clock size={12} className="text-gray-600" />
              <span className="text-xs font-medium text-gray-800">{duration}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
