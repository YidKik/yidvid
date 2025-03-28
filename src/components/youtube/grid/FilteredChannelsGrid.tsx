
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
    // Only log once per render
    if (hasRealChannels(channels)) {
      console.log(`Displaying ${channels.length} REAL channels`);
    } else {
      console.log(`Displaying ${channels.length} SAMPLE channels`);
    }
    
    // Filter out hidden channels (but only if we have enough channels)
    const filtered = channels?.length > 4 
      ? channels.filter(channel => !hiddenChannels.has(channel.channel_id)) 
      : channels || [];
    
    // Ensure all channels are unique by channel_id
    const uniqueChannels = filtered.reduce((acc: Channel[], current) => {
      const x = acc.find(item => item.channel_id === current.channel_id);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
    
    setDisplayChannels(uniqueChannels);
  }, [channels, hiddenChannels]); // Make sure to include dependencies properly

  if (displayChannels.length === 0) {
    return <EmptyChannelsState />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5 bg-white p-4 rounded-lg">
      {displayChannels.map((channel, index) => (
        <ChannelCard
          key={`${channel.channel_id}-${index}`}
          id={channel.id}
          channel_id={channel.channel_id}
          title={channel.title}
          thumbnail_url={channel.thumbnail_url} 
          index={index}
        />
      ))}
    </div>
  );
}
