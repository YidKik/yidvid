import { Link } from "react-router-dom";
import { formatDistanceToNow, parseISO } from "date-fns";

interface VideoCardProps {
  id: string;
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
  title,
  thumbnail,
  channelName,
  channelThumbnail,
  views,
  uploadedAt,
}: VideoCardProps) => {
  const formattedDate = typeof uploadedAt === 'string' 
    ? formatDistanceToNow(parseISO(uploadedAt), { addSuffix: true })
    : formatDistanceToNow(uploadedAt, { addSuffix: true });

  const formattedViews = views ? `${views.toLocaleString()} views` : '';

  return (
    <Link to={`/video/${id}`} className="block group">
      <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-3 shadow-[0_3px_10px_rgb(0,0,0,0.2)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex gap-3">
        {channelThumbnail && (
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
            <img
              src={channelThumbnail}
              alt={channelName}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div>
          <h3 className="font-medium text-youtube-title line-clamp-2 group-hover:text-button-custom">
            {title}
          </h3>
          <p className="text-youtube-small text-muted-foreground mt-1">
            {channelName}
          </p>
          <div className="text-youtube-small text-muted-foreground flex items-center gap-1">
            {views !== undefined && <span>{formattedViews}</span>}
            {views !== undefined && <span>•</span>}
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};