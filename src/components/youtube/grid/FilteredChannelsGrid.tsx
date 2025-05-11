
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
  const { isMobile, isTablet } = useIsMobile();
  
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

  // Determine column count based on screen size
  // Mobile: 2 columns
  // Tablet: 3 columns 
  // Desktop: 4-5 columns
  const getGridColumns = () => {
    if (isMobile) return 'grid-cols-2';
    if (isTablet) return 'grid-cols-3';
    return 'grid-cols-5'; // Default for desktop
  };

  return (
    <div className="w-full">
      <div className={`grid ${getGridColumns()} gap-4 mt-4 pb-8`}>
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
