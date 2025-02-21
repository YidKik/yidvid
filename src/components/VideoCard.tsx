
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
  const formattedDate = typeof uploadedAt === 'string' 
    ? formatDistanceToNow(parseISO(uploadedAt), { addSuffix: true })
    : formatDistanceToNow(uploadedAt, { addSuffix: true });

  const formattedViews = views ? `${views.toLocaleString()} views` : '';
  const routeId = uuid || id;

  return (
    <Link to={`/video/${routeId}`} className="block group">
      <div className={cn(
        "relative rounded-lg overflow-hidden bg-muted shadow-sm hover:shadow-md transition-all duration-300",
        isMobile ? "aspect-video w-full mb-2" : "aspect-video mb-2"
      )}>
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      {!hideInfo && (
        <div className="flex gap-2">
          {channelThumbnail && (
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={channelThumbnail}
                alt={channelName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium line-clamp-2 text-xs leading-4">
              {title}
            </h3>
            <p className="text-muted-foreground text-xs mt-0.5">
              {channelName}
            </p>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              {views !== undefined && <span>{formattedViews}</span>}
              {views !== undefined && <span>•</span>}
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
};
