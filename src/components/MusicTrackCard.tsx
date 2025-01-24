import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Music } from "lucide-react";

interface MusicTrackCardProps {
  id: string;
  title: string;
  thumbnail: string;
  artistName: string;
  plays: number;
  uploadedAt: Date;
  artistId: string;
  artistThumbnail?: string | null;
  duration: number;
  index: number;
}

export const MusicTrackCard = ({
  id,
  title,
  thumbnail,
  artistName,
  plays,
  uploadedAt,
  artistId,
  artistThumbnail,
  duration,
  index,
}: MusicTrackCardProps) => {
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPlays = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div 
      className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Link to={`/music/${id}`} className="block">
        <div className="aspect-video relative rounded-t-lg overflow-hidden">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(duration)}
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="flex gap-3">
            <Link 
              to={`/artist/${artistId}`}
              className="flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="w-9 h-9">
                <AvatarImage src={artistThumbnail || undefined} />
                <AvatarFallback>
                  <Music className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-grow min-w-0">
              <h3 className="text-youtube-title font-medium line-clamp-2 mb-1">
                {title}
              </h3>
              <Link
                to={`/artist/${artistId}`}
                className="text-youtube-small text-secondary hover:text-secondary-hover"
                onClick={(e) => e.stopPropagation()}
              >
                {artistName}
              </Link>
              <div className="text-youtube-small text-secondary mt-1">
                {formatPlays(plays)} plays • {formatDistanceToNow(uploadedAt, { addSuffix: true })}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};