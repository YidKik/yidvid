
import { useLocation } from "react-router-dom";
import { RequestChannelDialog } from "./RequestChannelDialog";
import { ChannelsGridSkeleton } from "./grid/ChannelsGridSkeleton";
import { ChannelDataProvider } from "./grid/ChannelDataProvider";
import { FilteredChannelsGrid } from "./grid/FilteredChannelsGrid";

interface ChannelsGridProps {
  onError?: (error: any) => void;
}

export const ChannelsGrid = ({ onError }: ChannelsGridProps) => {
  const location = useLocation();
  const isMainPage = location.pathname === "/";

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 md:px-4 animate-scaleIn">
      <div className="flex items-center justify-between mb-3 md:mb-8">
        <h2 className="text-base md:text-2xl font-bold text-accent">View All Channels</h2>
        <RequestChannelDialog />
      </div>
      
      <ChannelDataProvider onError={onError}>
        {({ displayChannels, isLoading }) => {
          // Skip loading animation on main page
          const showSkeleton = isLoading && !isMainPage;

          if (showSkeleton) {
            return <ChannelsGridSkeleton />;
          }

          return <FilteredChannelsGrid 
            channels={displayChannels} 
            isMainPage={isMainPage} 
          />;
        }}
      </ChannelDataProvider>
    </div>
  );
};
