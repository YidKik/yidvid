
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
    <Link to={`/video/${routeId}`} className="block group w-full">
      <div className={cn(
        "relative rounded-lg overflow-hidden bg-muted shadow-sm hover:shadow-md transition-all duration-300",
        isMobile ? "aspect-video w-full mb-0" : "aspect-video mb-2"
      )}>
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
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
              />
            </div>
          )}
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3 className={cn(
              "font-medium line-clamp-2 text-[#030303]",
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
