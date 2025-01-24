import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

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
    ? uploadedAt 
    : formatDistanceToNow(uploadedAt, { addSuffix: true });

  const formattedViews = views ? `${views.toLocaleString()} views` : '';

  return (
    <Link to={`/video/${id}`} className="block group">
      <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-3">
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