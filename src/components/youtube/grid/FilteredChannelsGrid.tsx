
import { useState, useEffect } from "react";
import { Channel } from "@/hooks/channel/useChannelsGrid";
import { ChannelCard } from "./ChannelCard";

interface FilteredChannelsGridProps {
  channels: Channel[];
  isMainPage?: boolean;
}

export const FilteredChannelsGrid = ({ 
  channels, 
  isMainPage = false 
}: FilteredChannelsGridProps) => {
  const [displayChannels, setDisplayChannels] = useState<Channel[]>([]);
  const [initialized, setInitialized] = useState(false);
  
  // Process channels only once when component mounts or channels change
  useEffect(() => {
    if (!initialized && channels.length > 0) {
      // Always show all channels, regardless of main page or not
      const hasRealChannels = channels.some(c => 
        !c.id.toString().includes('sample') && 
        c.title !== 'Sample Channel');
      
      if (hasRealChannels) {
        console.log(`Displaying ${channels.length} REAL channels`);
      } else {
        console.log(`Displaying ${channels.length} SAMPLE channels`);
      }
      
      setDisplayChannels(channels);
      setInitialized(true);
    } else if (initialized && channels.length > 0 && channels !== displayChannels) {
      // Update display channels if channel data changes
      console.log("Channel data updated, refreshing display");
      setDisplayChannels(channels);
    }
  }, [channels, initialized, displayChannels]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 mt-2 pb-6">
        {displayChannels.map((channel, index) => (
          <ChannelCard 
            key={channel.id?.toString() || `channel-${index}`}
            channel={channel} 
            index={index}
          />
        ))}
      </div>
    </div>
  );
};
