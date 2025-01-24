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
  channelId: string;
  channelThumbnail?: string | null;
  index?: number;
}

export const VideoCard = ({
  id,
  title,
  thumbnail,
  channelName,
  views,
  uploadedAt,
  channelId,
  channelThumbnail,
  index = 0,
}: VideoCardProps) => {
  const animationDelay = `${index * 0.1}s`;

  return (
    <div 
      className="group cursor-pointer opacity-0 animate-fadeIn rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
      style={{ animationDelay, animationFillMode: 'forwards' }}
    >
      <Link to={`/music/${id}`} className="block">
        <div className="aspect-video rounded-lg overflow-hidden mb-3 transition-transform duration-300 ease-out group-hover:scale-[1.02]">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
      <div className="flex gap-3 p-3">
        <div className="flex-shrink-0">
          <Link to={`/artist/${channelId}`}>
            <Avatar className="w-10 h-10 rounded-full border-2 border-background shadow-sm transition-transform duration-300 hover:scale-110">
              {channelThumbnail ? (
                <AvatarImage 
                  src={channelThumbnail} 
                  alt={channelName}
                  className="object-cover"
                  onError={(e) => {
                    console.error("Error loading channel thumbnail:", channelThumbnail);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <AvatarFallback className="bg-primary/10">
                  <Youtube className="w-5 h-5 text-primary" />
                </AvatarFallback>
              )}
            </Avatar>
          </Link>
        </div>
        <div className="flex-1">
          <Link to={`/music/${id}`}>
            <h3 className="text-youtube-title font-medium text-accent line-clamp-2 mb-1 transition-colors duration-200">
              {title}
            </h3>
          </Link>
          <Link 
            to={`/artist/${channelId}`}
            className="text-youtube-small font-normal text-secondary hover:text-accent transition-colors duration-200"
          >
            {channelName}
          </Link>
          <div className="text-youtube-small font-normal text-secondary flex items-center gap-1">
            <span>{views?.toLocaleString() || 0} views</span>
            <span>•</span>
            <span>{formatDistanceToNow(uploadedAt, { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};