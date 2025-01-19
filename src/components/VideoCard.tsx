import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Youtube } from "lucide-react";

interface VideoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  views: number;
  uploadedAt: Date;
  channelThumbnail?: string;
}

export const VideoCard = ({
  id,
  title,
  thumbnail,
  channelName,
  views,
  uploadedAt,
  channelThumbnail,
}: VideoCardProps) => {
  return (
    <Link to={`/video/${id}`} className="group cursor-pointer">
      <div className="aspect-video rounded-lg overflow-hidden mb-3 group-hover:animate-gentle-fade">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <Link to={`/channel/${channelName}`} onClick={(e) => e.stopPropagation()}>
            <Avatar className="w-8 h-8">
              <AvatarImage src={channelThumbnail} alt={channelName} />
              <AvatarFallback>
                <Youtube className="w-4 h-4 text-primary" />
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
        <div className="flex-1">
          <h3 className="text-youtube-title font-medium text-accent line-clamp-2 mb-1">
            {title}
          </h3>
          <Link 
            to={`/channel/${channelName}`} 
            onClick={(e) => e.stopPropagation()}
            className="text-youtube-small font-normal text-secondary hover:text-accent"
          >
            {channelName}
          </Link>
          <div className="text-youtube-small font-normal text-secondary flex items-center gap-1">
            <span>{views.toLocaleString()} views</span>
            <span>•</span>
            <span>{formatDistanceToNow(uploadedAt, { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};