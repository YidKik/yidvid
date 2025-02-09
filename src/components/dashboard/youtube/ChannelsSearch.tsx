
import { Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ChannelSearch } from "@/components/youtube/ChannelSearch";

interface ChannelsSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  videoSearchQuery: string;
  setVideoSearchQuery: (query: string) => void;
}

export const ChannelsSearch = ({
  searchQuery,
  setSearchQuery,
  videoSearchQuery,
  setVideoSearchQuery,
}: ChannelsSearchProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <ChannelSearch value={searchQuery} onChange={setSearchQuery} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search videos..."
            value={videoSearchQuery}
            onChange={(e) => setVideoSearchQuery(e.target.value)}
            className="w-64"
          />
        </div>
      </div>
    </div>
  );
};
