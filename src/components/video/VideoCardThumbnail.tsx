
import { useState, useEffect, memo } from 'react';
import { cn } from "@/lib/utils";

interface VideoCardThumbnailProps {
  thumbnail: string;
  title: string;
  isSample?: boolean;
  className?: string;
}

export const VideoCardThumbnail = memo(({
  thumbnail,
  title,
  isSample = false,
  className
}: VideoCardThumbnailProps) => {
  const [imageError, setImageError] = useState(false);
  const [isValidThumbnail, setIsValidThumbnail] = useState(true);
  
  // Check thumbnail validity with optimized validation
  useEffect(() => {
    // Quick validation for obviously invalid URLs to prevent unnecessary loading attempts
    if (!thumbnail || 
        thumbnail.includes('no_thumbnail') || 
        thumbnail.includes('placeholder') ||
        thumbnail.includes('unavailable') ||
        thumbnail === 'null' ||
        thumbnail === 'undefined') {
      setIsValidThumbnail(false);
    } else {
      setIsValidThumbnail(true);
      setImageError(false);
    }
  }, [thumbnail]);

  const handleImageError = () => {
    // Log error but avoid console spam
    if (process.env.NODE_ENV === 'development') {
      console.log(`Image error for thumbnail: ${thumbnail}`);
    }
    setImageError(true);
  };
  
  // If thumbnail is invalid or errored, we won't render this component
  if (!isValidThumbnail || imageError) {
    return null;
  }

  return (
    <div className={cn(
      "relative aspect-video overflow-hidden rounded-lg bg-gray-100 shadow-sm group-hover:shadow-md transition-all",
      className
    )}>
      <img
        src={thumbnail}
        alt={title}
        className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
        loading="lazy"
        decoding="async" 
        fetchPriority="high"
        onError={handleImageError}
      />
      
      {isSample && (
        <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">
          Sample
        </div>
      )}
      
      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
});
