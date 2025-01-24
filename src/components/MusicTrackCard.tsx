import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Music, Play } from "lucide-react";
import { cn } from "@/lib/utils";

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
      className={cn(
        "group relative bg-background rounded-lg transition-all duration-300 animate-fadeIn hover:bg-accent/50",
        "cursor-pointer"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Link to={`/music/${id}`} className="block">
        <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Play className="w-12 h-12 text-white" />
          </div>
          {duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(duration)}
            </div>
          )}
        </div>
        <div className="px-3 pb-4">
          <div className="flex gap-3">
            <Link 
              to={`/artist/${artistId}`}
              className="flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={artistThumbnail || undefined} />
                <AvatarFallback>
                  <Music className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-grow min-w-0">
              <h3 className="font-medium line-clamp-2 mb-1 text-sm">
                {title}
              </h3>
              <Link
                to={`/artist/${artistId}`}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {artistName}
              </Link>
              <div className="text-xs text-muted-foreground mt-1">
                {formatPlays(plays)} plays • {formatDistanceToNow(uploadedAt, { addSuffix: true })}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};