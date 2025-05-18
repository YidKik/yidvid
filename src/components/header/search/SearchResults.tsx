
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { SearchVideo, SearchChannel } from "./useSearch";

interface SearchResultsProps {
  isSearching: boolean;
  videos: SearchVideo[];
  channels: SearchChannel[];
  onResultClick: () => void;
  showResults: boolean;
}

export const SearchResults = ({
  isSearching,
  videos = [],
  channels = [],
  onResultClick,
  showResults
}: SearchResultsProps) => {
  const isMobile = useIsMobile();
  
  if (!showResults || (!isSearching && videos.length === 0 && channels.length === 0)) {
    return null;
  }

  return (
    <div 
      className={`absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 ${
        isMobile ? 'w-full' : 'w-full max-h-[400px]'
      }`}
      style={{
        top: isMobile ? '35px' : undefined,
        width: isMobile ? '100%' : undefined
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <ScrollArea className={`${isMobile ? 'h-[35vh]' : 'h-[400px]'} overflow-y-auto scrollbar-hide`}>
        <div className="p-2">
          {isSearching ? (
            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
              Searching...
            </div>
          ) : (
            <>
              {/* Channels Section */}
              {channels && channels.length > 0 && (
                <ChannelResults channels={channels} onResultClick={onResultClick} />
              )}

              {/* Videos Section */}
              {videos && videos.length > 0 && (
                <VideoResults videos={videos} onResultClick={onResultClick} />
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

interface ChannelResultsProps {
  channels: SearchChannel[];
  onResultClick: () => void;
}

const ChannelResults = ({ channels, onResultClick }: ChannelResultsProps) => {
  if (!channels || channels.length === 0) return null;
  
  return (
    <div className="mb-3">
      <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
        Channels
      </div>
      {channels.map((channel) => (
        <Link
          key={channel.channel_id}
          to={`/channel/${channel.channel_id}`}
          className="flex items-center gap-3 p-2 hover:bg-gray-50 transition-colors rounded-lg"
          onClick={onResultClick}
        >
          <img
            src={channel.thumbnail_url || '/placeholder.svg'}
            alt={channel.title}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-sm text-[#555555] font-medium line-clamp-1">
            {channel.title}
          </span>
        </Link>
      ))}
    </div>
  );
};

interface VideoResultsProps {
  videos: SearchVideo[];
  onResultClick: () => void;
}

const VideoResults = ({ videos, onResultClick }: VideoResultsProps) => {
  if (!videos || videos.length === 0) return null;
  
  return (
    <div>
      <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
        Videos
      </div>
      {videos.map((video) => (
        <Link
          key={video.id}
          to={`/video/${video.id}`}
          className="flex items-start gap-2 md:gap-3 p-2 hover:bg-gray-50 transition-colors rounded-lg"
          onClick={onResultClick}
        >
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-12 h-9 md:w-16 md:h-12 object-cover rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-[#555555] font-medium line-clamp-2">
              {video.title}
            </p>
            <p className="text-[10px] md:text-xs text-[#555555]/70 mt-0.5">
              {video.channel_name}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};
