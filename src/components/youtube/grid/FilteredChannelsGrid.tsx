
import { useState, useEffect } from "react";
import { Channel } from "@/hooks/channel/useChannelsGrid";
import { ChannelCard } from "./ChannelCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { DelayedLoadingAnimation } from "@/components/ui/DelayedLoadingAnimation";

interface FilteredChannelsGridProps {
  channels: Channel[];
  isMainPage?: boolean;
  isLoading?: boolean;
}

export const FilteredChannelsGrid = ({ 
  channels, 
  isMainPage = false,
  isLoading = false
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

  // Show loading animation if loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center my-8">
        <DelayedLoadingAnimation 
          size={isMobile ? "small" : "medium"} 
          text="Loading channels..."
          delayMs={3000}
        />
      </div>
    );
  }

  // Determine column count based on screen size - ENFORCED TABLET LOGIC
  const getGridColumns = () => {
    if (isMobile) return 'grid-cols-2';
    if (isTablet) return 'grid-cols-3'; // ENFORCED: Tablet shows exactly 3 columns
    return 'grid-cols-5'; // Default for desktop
  };

  // Display total channel count
  const totalChannels = displayChannels.length;

  console.log(`FilteredChannelsGrid: Device - isMobile: ${isMobile}, isTablet: ${isTablet}, gridColumns: ${getGridColumns()}, totalChannels: ${totalChannels}`);

  return (
    <div className="w-full">
      <div className={`grid ${getGridColumns()} gap-4 mt-4 pb-8 tablet-channels-grid`}>
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
