
import { Search } from "lucide-react";
import { ChannelSearch } from "@/components/youtube/ChannelSearch";
import { ChannelListItem } from "@/components/youtube/ChannelListItem";
import { YoutubeChannelsTable } from "@/integrations/supabase/types/youtube-channels";

interface ChannelFilteredListProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredChannels?: YoutubeChannelsTable["Row"][];
  hiddenChannels: Set<string>;
  onToggle: (channelId: string) => void;
  isLocked: boolean;
}

export const ChannelFilteredList = ({
  searchQuery,
  setSearchQuery,
  filteredChannels,
  hiddenChannels,
  onToggle,
  isLocked
}: ChannelFilteredListProps) => {
  return (
    <div className={`relative ${isLocked ? 'pointer-events-none' : ''}`}>
      {isLocked && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 rounded-lg" />
      )}
      
      <div className="my-2 md:my-4">
        <div className="flex items-center gap-1.5 md:gap-2 p-1 md:p-2 bg-white rounded-lg border border-gray-200">
          <Search className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
          <ChannelSearch value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      <div className="max-h-[250px] md:max-h-[350px] overflow-y-auto scrollbar-hide space-y-1 md:space-y-2">
        {filteredChannels?.map((channel) => (
          <ChannelListItem
            key={channel.channel_id}
            channel={channel}
            isHidden={hiddenChannels.has(channel.channel_id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
};
