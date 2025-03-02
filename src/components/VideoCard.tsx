
import { Link } from "react-router-dom";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  id: string;
  uuid?: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelThumbnail?: string;
  channelId?: string;
  views?: number;
  uploadedAt: string | Date;
  hideInfo?: boolean;
}

export const VideoCard = ({
  id,
  uuid,
  title,
  thumbnail,
  channelName,
  channelThumbnail,
  views,
  uploadedAt,
  hideInfo = false,
}: VideoCardProps) => {
  const isMobile = useIsMobile();
  
  // Handle date formatting more safely
  const formattedDate = (() => {
    try {
      if (typeof uploadedAt === 'string') {
        return formatDistanceToNow(parseISO(uploadedAt), { addSuffix: true });
      } else {
        return formatDistanceToNow(uploadedAt, { addSuffix: true });
      }
    } catch (error) {
      console.error("Date formatting error:", error);
      return "recently";
    }
  })();

  const formattedViews = views ? `${views.toLocaleString()} views` : '';
  const routeId = uuid || id;

  // Safely handle potentially missing thumbnail URL
  const thumbnailUrl = thumbnail || "/placeholder.svg";

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
            // Fallback to placeholder if image fails to load
            (e.target as HTMLImageElement).src = "/placeholder.svg";
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
              "font-medium line-clamp-2 text-[#030303] transition-all duration-500 ease-in-out group-hover:text-[#ea384c]",
              isMobile ? "text-[11px] leading-[13px] mb-0.5 font-roboto" : "text-sm leading-5"
            )}>
              {title}
            </h3>
            <p className={cn(
              "text-muted-foreground truncate font-roboto",
              isMobile ? "text-[9px] mt-0" : "text-[11px] mt-0.5"
            )}>
              {channelName}
            </p>
            <div className={cn(
              "text-muted-foreground flex items-center space-x-1 truncate font-roboto",
              isMobile ? "text-[9px] mt-0.5" : "text-[10px] mt-0.5"
            )}>
              {views !== undefined && (
                <span className="truncate">{formattedViews}</span>
              )}
              {views !== undefined && <span>•</span>}
              <span className="truncate">{formattedDate}</span>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
};
