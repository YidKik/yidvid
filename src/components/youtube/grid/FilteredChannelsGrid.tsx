
import { useState, useEffect, useCallback } from "react";
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
      const limitedChannels = isMainPage ? channels.slice(0, 8) : channels;
      
      const hasRealChannels = channels.some(c => 
        !c.id.toString().includes('sample') && 
        c.title !== 'Sample Channel');
      
      if (hasRealChannels) {
        console.log(`Displaying ${limitedChannels.length} REAL channels`);
      } else {
        console.log(`Displaying ${limitedChannels.length} SAMPLE channels`);
      }
      
      setDisplayChannels(limitedChannels);
      setInitialized(true);
    }
  }, [channels, isMainPage, initialized]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 mt-2">
      {displayChannels.map((channel) => (
        <ChannelCard key={channel.id} channel={channel} />
      ))}
    </div>
  );
};
