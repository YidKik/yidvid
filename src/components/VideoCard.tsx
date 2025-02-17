
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
}: VideoCardProps) => {
  const isMobile = useIsMobile();
  const formattedDate = typeof uploadedAt === 'string' 
    ? formatDistanceToNow(parseISO(uploadedAt), { addSuffix: true })
    : formatDistanceToNow(uploadedAt, { addSuffix: true });

  const formattedViews = views ? `${views.toLocaleString()} views` : '';
  const routeId = uuid || id;

  return (
    <Link to={`/video/${routeId}`} className="block group">
      <div className={cn(
        "rounded-lg overflow-hidden bg-muted shadow-sm hover:shadow-md transition-all duration-300",
        isMobile ? "aspect-video w-full" : "mb-2 md:mb-3"
      )}>
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex gap-2 md:gap-3 mt-2">
        {channelThumbnail && (
          <div className="w-7 h-7 md:w-9 md:h-9 rounded-full overflow-hidden flex-shrink-0">
            <img
              src={channelThumbnail}
              alt={channelName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${isMobile ? 'text-sm leading-tight' : 'text-youtube-title'} line-clamp-2 group-hover:text-button-custom`}>
            {title}
          </h3>
          <p className={`${isMobile ? 'text-xs' : 'text-youtube-small'} text-muted-foreground mt-0.5 md:mt-1 line-clamp-1`}>
            {channelName}
          </p>
          <div className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
            {views !== undefined && <span>{formattedViews}</span>}
            {views !== undefined && <span>•</span>}
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
