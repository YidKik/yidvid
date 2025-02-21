
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
        "relative rounded-xl overflow-hidden bg-muted shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1",
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
        <div className="flex gap-3">
          {channelThumbnail && (
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={channelThumbnail}
                alt={channelName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium line-clamp-2 text-sm md:text-base">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              {channelName}
            </p>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
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
