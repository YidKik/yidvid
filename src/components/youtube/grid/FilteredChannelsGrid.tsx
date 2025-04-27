
import { useState, useEffect } from "react";
import { Channel } from "@/hooks/channel/useChannelsGrid";
import { ChannelCard } from "./ChannelCard";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const { isMobile } = useIsMobile();
  
  useEffect(() => {
    if (!initialized && channels.length > 0) {
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
      console.log("Channel data updated, refreshing display");
      setDisplayChannels(channels);
    }
  }, [channels, initialized, displayChannels]);

  return (
    <div className="w-full">
      <div className={`grid grid-cols-2 gap-4 mt-4 pb-8`}>
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
