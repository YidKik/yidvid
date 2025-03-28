
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

  // Get responsive grid classes based on screen width
  const getGridClasses = () => {
    const width = window.innerWidth;
    if (width < 640) return "grid-cols-3 gap-2"; // Mobile
    if (width >= 640 && width < 1024) return "grid-cols-3 sm:grid-cols-3 gap-3"; // Tablet
    return "grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4"; // Desktop
  };
  
  const [gridClasses, setGridClasses] = useState(getGridClasses());
  
  // Update grid classes on window resize
  useEffect(() => {
    const handleResize = () => {
      setGridClasses(getGridClasses());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      
    setDisplayChannels(filtered);
  }, [channels, hiddenChannels]); // Make sure to include dependencies properly

  if (displayChannels.length === 0) {
    return <EmptyChannelsState />;
  }

  return (
    <div className={gridClasses}>
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
