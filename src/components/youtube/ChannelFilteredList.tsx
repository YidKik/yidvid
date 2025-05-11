
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
    <div className={`relative ${isLocked ? 'pointer-events-none' : ''}`}>
      {isLocked && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 rounded-lg" />
      )}
      
      <div className="my-2 md:my-4">
        <div className="flex items-center gap-1.5 md:gap-2 p-1 md:p-2 bg-white rounded-lg border border-gray-200">
          <Search className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
          <ChannelSearch value={searchQuery} onChange={handleSearch} />
        </div>
      </div>

      <div className="max-h-[250px] md:max-h-[350px] overflow-y-auto scrollbar-hide space-y-1 md:space-y-2">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : filteredChannels && filteredChannels.length > 0 ? (
          filteredChannels.map((channel) => (
            <ChannelListItem
              key={channel.channel_id}
              channel={channel}
              isHidden={hiddenChannels.has(channel.channel_id)}
              onToggle={onToggle}
            />
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
            {searchQuery ? 
              "No channels found matching your search. Try a different search term." : 
              "No channels available. Please try refreshing the page."}
          </div>
        )}
      </div>
    </div>
  );
};
