
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Eye, Clock } from "lucide-react";

interface VideoCardThumbnailProps {
  thumbnail: string;
  title: string;
  isSample?: boolean;
  views?: number;
  formattedDate?: string;
}

export const VideoCardThumbnail = ({
  thumbnail,
  title,
  isSample = false,
  views,
  formattedDate
}: VideoCardThumbnailProps) => {
  const [imageError, setImageError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const { isMobile } = useIsMobile();
  
  // Format view count with appropriate suffix (K, M)
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    } else {
      return count.toString();
    }
  };
  
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
        "rounded-lg transition-all duration-300",
        "hover:scale-[1.02] border-2 border-transparent hover:border-red-500",
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Overlay with slight darkness that changes on hover */}
      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300 z-10"></div>
      
      {/* Views badge - bottom left */}
      {views !== undefined && (
        <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1 bg-black/70 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
          <Eye size={11} className="text-white/90" />
          <span style={{ fontFamily: "'Tahoma', sans-serif" }}>{formatViewCount(views)}</span>
        </div>
      )}
      
      {/* Date badge - bottom right */}
      {formattedDate && (
        <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1 bg-black/70 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
          <Clock size={11} className="text-white/90" />
          <span style={{ fontFamily: "'Tahoma', sans-serif" }}>{formattedDate}</span>
        </div>
      )}
      
      {/* Main thumbnail image */}
      <img
        src={imageError ? "/placeholder.svg" : thumbnail}
        alt={title}
        loading="lazy"
        className="w-full h-full object-cover transition-all duration-300 ease-out"
        onError={() => setImageError(true)}
      />
    </div>
  );
};
