
import { useState, useEffect } from "react";
import { ChannelCard } from "./ChannelCard";
import { Channel } from "@/hooks/channel/useChannelsGrid";
import { EmptyChannelsState } from "./EmptyChannelsState";
import { useHiddenChannels } from "@/hooks/channel/useHiddenChannels";

interface FilteredChannelsGridProps {
  channels: Channel[];
  isMainPage: boolean;
}

export const FilteredChannelsGrid = ({ channels, isMainPage }: FilteredChannelsGridProps) => {
  const { hiddenChannels } = useHiddenChannels();
  const [displayChannels, setDisplayChannels] = useState<Channel[]>([]);

  // Check if we have real data (not samples)
  const hasRealChannels = (data?: Channel[]) => {
    if (!data || data.length === 0) return false;
    return data.some(c => 
      !c.id.toString().includes('sample') && 
      !c.channel_id.includes('sample') &&
      c.title !== "Sample Channel 1"
    );
  };

  useEffect(() => {
    if (hasRealChannels(channels)) {
      console.log(`Displaying ${channels.length} REAL channels`);
    } else {
      console.log(`Displaying ${channels.length} SAMPLE channels`);
    }
    
    // Filter out hidden channels (but only if we have enough channels)
    const filtered = channels?.length > 4 
      ? channels.filter(channel => !hiddenChannels.has(channel.channel_id)) 
      : channels || [];
      
    setDisplayChannels(filtered);
  }, [channels, hiddenChannels]);

  if (displayChannels.length === 0) {
    return <EmptyChannelsState />;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
      {displayChannels.map((channel, index) => (
        <ChannelCard
          key={channel.id || `channel-${index}`}
          id={channel.id}
          channel_id={channel.channel_id}
          title={channel.title}
          thumbnail_url={channel.thumbnail_url} 
          index={index}
        />
      ))}
    </div>
  );
};
