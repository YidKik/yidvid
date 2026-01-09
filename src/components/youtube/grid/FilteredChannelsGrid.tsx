
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
  const { isMobile, isTablet } = useIsMobile();

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

  const getGridColumns = () => {
    if (isMobile) return 'grid-cols-2';
    if (isTablet) return 'grid-cols-3';
    return 'grid-cols-5';
  };

  return (
    <div className="w-full">
      <div className={`grid ${getGridColumns()} gap-4 md:gap-6 mt-6 pb-8`}>
        {channels.map((channel, index) => (
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
