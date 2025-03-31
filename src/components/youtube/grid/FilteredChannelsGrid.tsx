
import { useState, useEffect, useCallback } from "react";
import { Channel } from "@/hooks/channel/useChannelsGrid";
import { ChannelCard } from "./ChannelCard";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    }
  }, [channels, initialized]);

  return (
    <ScrollArea className={isMainPage ? "h-[70vh] md:h-[75vh]" : "max-h-full"}>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 mt-2 pb-4">
        {displayChannels.map((channel, index) => (
          <ChannelCard 
            key={channel.id?.toString() || `channel-${index}`}
            channel={channel} 
            index={index}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
