
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface VideoCardThumbnailProps {
  thumbnail: string;
  title: string;
  isSample?: boolean;
}

export const VideoCardThumbnail = ({
  thumbnail,
  title,
  isSample = false
}: VideoCardThumbnailProps) => {
  const [imageError, setImageError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovering(true);
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
      className="relative overflow-hidden rounded-lg aspect-video w-full group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Overlay with slight darkness that changes on hover */}
      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300 z-10"></div>
      
      {/* Main thumbnail image */}
      <img
        src={imageError ? "/placeholder.svg" : thumbnail}
        alt={title}
        loading="lazy"
        className={cn(
          "w-full h-full object-cover",
          "transition-all duration-300 ease-out",
          isHovering ? "scale-[1.02] translate-y-[-4px]" : "scale-100", // More subtle zoom and small lift effect
        )}
        onError={() => setImageError(true)}
      />
      
      {/* Preview animation effect - shows on hover */}
      {isHovering && (
        <div className="absolute inset-0 z-20 overflow-hidden">
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent",
            "animate-shimmer-preview" // Animation defined in global CSS
          )} />
        </div>
      )}
    </div>
  );
};
