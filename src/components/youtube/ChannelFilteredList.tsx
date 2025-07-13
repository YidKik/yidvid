
import { Search } from "lucide-react";
import { ChannelSearch } from "@/components/youtube/ChannelSearch";
import { ChannelListItem } from "@/components/youtube/ChannelListItem";
import { YoutubeChannelsTable } from "@/integrations/supabase/types/youtube-channels";
import { Channel } from "@/hooks/channel/useChannelsGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

interface ChannelFilteredListProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredChannels?: (YoutubeChannelsTable["Row"] | Channel)[];
  hiddenChannels: Set<string>;
  onToggle: (channelId: string) => void;
  isLocked: boolean;
  isLoading?: boolean;
}

export const ChannelFilteredList = ({
  searchQuery,
  setSearchQuery,
  filteredChannels,
  hiddenChannels,
  onToggle,
  isLocked,
  isLoading = false
}: ChannelFilteredListProps) => {
  const handleSearch = (value: string) => {
    console.log("Search query changed to:", value);
    setSearchQuery(value);
  };

  // Log when hidden channels update
  useEffect(() => {
    console.log(`ChannelFilteredList - Hidden channels count: ${hiddenChannels.size}`);
  }, [hiddenChannels]);

  return (
    <div className={`relative transition-all duration-300 ${isLocked ? 'pointer-events-none' : ''}`}>
      {isLocked && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 rounded-2xl" />
      )}
      
      <div className="my-4">
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border border-primary/20 shadow-sm">
          <Search className="h-5 w-5 text-primary flex-shrink-0" />
          <ChannelSearch value={searchQuery} onChange={handleSearch} />
        </div>
      </div>

      <div className="max-h-[400px] md:max-h-[500px] overflow-y-auto scrollbar-hide space-y-3 pr-2">
        {isLoading ? (
          <div className="space-y-3">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="p-4 border border-primary/10 rounded-2xl bg-white animate-pulse">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredChannels && filteredChannels.length > 0 ? (
          <div className="space-y-3">
            {filteredChannels.map((channel) => (
              <ChannelListItem
                key={channel.channel_id}
                channel={channel}
                isHidden={hiddenChannels.has(channel.channel_id)}
                onToggle={onToggle}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-gradient-to-br from-secondary/20 to-primary/10 rounded-2xl border border-primary/20">
            <Search className="h-12 w-12 text-primary/50 mx-auto mb-3" />
            <p className="text-primary font-medium mb-1">
              {searchQuery ? "No channels found" : "No channels available"}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 
                "Try adjusting your search terms or check back later." : 
                "Channels will appear here when they become available."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
