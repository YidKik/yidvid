
import { Link } from "react-router-dom";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface VideoCardProps {
  id: string;
  uuid?: string;
  video_id?: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelThumbnail?: string;
  channelId?: string;
  views?: number | null;
  uploadedAt: string | Date;
  hideInfo?: boolean;
}

export const VideoCard = ({
  id,
  uuid,
  video_id,
  title,
  thumbnail,
  channelName,
  channelThumbnail,
  channelId,
  views,
  uploadedAt,
  hideInfo = false,
}: VideoCardProps) => {
  const isMobile = useIsMobile();
  
  // Handle thumbnail errors by logging
  useEffect(() => {
    if (!thumbnail || thumbnail === '/placeholder.svg') {
      console.warn(`VideoCard ${id} is using a placeholder thumbnail`);
    }
  }, [thumbnail, id]);
  
  // Handle date formatting more safely
  const formattedDate = (() => {
    try {
      if (typeof uploadedAt === 'string') {
        return formatDistanceToNow(parseISO(uploadedAt), { addSuffix: true });
      } else if (uploadedAt instanceof Date) {
        return formatDistanceToNow(uploadedAt, { addSuffix: true });
      }
      return "recently";
    } catch (error) {
      console.error("Date formatting error:", error, uploadedAt);
      return "recently";
    }
  })();

  const formattedViews = views ? `${views.toLocaleString()} views` : 'No views';
  const routeId = uuid || video_id || id;

  // Safely handle potentially missing thumbnail URL
  const thumbnailUrl = thumbnail && thumbnail !== '/placeholder.svg' 
    ? thumbnail 
    : "/placeholder.svg";

  return (
    <Link 
      to={`/video/${routeId}`} 
      className="block group w-full transition-all ease-in-out duration-500"
    >
      <div className={cn(
        "relative rounded-lg overflow-hidden bg-muted shadow-sm transition-all duration-500 ease-in-out transform group-hover:-translate-y-2 group-hover:shadow-lg",
        isMobile ? "aspect-video w-full mb-0" : "aspect-video mb-2"
      )}>
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            // Show placeholder with centered small logo
            (e.target as HTMLImageElement).src = "/placeholder.svg";
            
            // Create a container for the thumbnail with logo
            const imgElement = e.target as HTMLImageElement;
            const parent = imgElement.parentElement;
            
            if (parent) {
              // Remove any previously created logo overlay
              const existingOverlay = parent.querySelector('.thumbnail-logo-overlay');
              if (existingOverlay) existingOverlay.remove();
              
              // Create the logo overlay
              const logoOverlay = document.createElement('div');
              logoOverlay.className = 'thumbnail-logo-overlay absolute inset-0 flex items-center justify-center';
              
              // Create the logo image
              const logoImg = document.createElement('img');
              logoImg.src = "/lovable-uploads/2df6b540-f798-4831-8fcc-255a55486aa0.png";
              logoImg.alt = "Site Logo";
              logoImg.className = 'w-12 h-12 opacity-70'; // Smaller centered logo
              
              // Append elements
              logoOverlay.appendChild(logoImg);
              parent.appendChild(logoOverlay);
            }
          }}
        />
      </div>
      {!hideInfo && (
        <div className={cn(
          "flex gap-2 w-full",
          isMobile && "flex-col gap-0"
        )}>
          {channelThumbnail && !isMobile && (
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={channelThumbnail}
                alt={channelName}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3 className={cn(
              "video-title line-clamp-2 text-[#030303] transition-all duration-500 ease-in-out group-hover:text-[#ea384c]",
              isMobile ? "text-[11px] leading-[14px] mb-0.5 font-semibold" : "text-sm leading-5 font-semibold"
            )}>
              {title || "Untitled Video"}
            </h3>
            <p className={cn(
              "text-muted-foreground truncate video-channel-name",
              isMobile ? "text-[9px] mt-0 font-medium" : "text-[11px] mt-0.5 font-medium"
            )}>
              {channelName || "Unknown Channel"}
            </p>
            <div className={cn(
              "text-muted-foreground flex items-center space-x-1 truncate video-meta-text",
              isMobile ? "text-[9px] mt-0.5" : "text-[10px] mt-0.5"
            )}>
              {views !== undefined && (
                <span className="truncate font-medium">{formattedViews}</span>
              )}
              {views !== undefined && <span>•</span>}
              <span className="truncate font-medium">{formattedDate}</span>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
};
