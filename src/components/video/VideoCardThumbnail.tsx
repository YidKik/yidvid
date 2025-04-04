
import { cn } from "@/lib/utils";
import { useState } from "react";

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

  return (
    <div className="relative overflow-hidden rounded-lg aspect-video w-full group">
      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-300 z-10"></div>
      
      <img
        src={imageError ? "/placeholder.svg" : thumbnail}
        alt={title}
        loading="lazy"
        className={cn(
          "w-full h-full object-cover",
          "transition-all duration-300 ease-out",
          "group-hover:scale-[1.02]" // Subtle scale effect on hover
        )}
        onError={() => setImageError(true)}
      />
      
      {/* Add play indicator that appears on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-white ml-1"></div>
        </div>
      </div>
    </div>
  );
};
