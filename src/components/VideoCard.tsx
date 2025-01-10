import { formatDistanceToNow } from "date-fns";

interface VideoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  views: number;
  uploadedAt: Date;
}

export const VideoCard = ({
  id,
  title,
  thumbnail,
  channelName,
  views,
  uploadedAt,
}: VideoCardProps) => {
  return (
    <div className="group cursor-pointer">
      <div className="aspect-video rounded-lg overflow-hidden mb-3 group-hover:animate-card-hover">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <h3 className="text-youtube-title font-medium text-accent line-clamp-2 mb-1 hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-youtube-small font-normal text-secondary hover:text-accent transition-colors">
            {channelName}
          </p>
          <div className="text-youtube-small font-normal text-secondary flex items-center gap-1">
            <span>{views.toLocaleString()} views</span>
            <span>•</span>
            <span>{formatDistanceToNow(uploadedAt, { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};