
import { useLocation } from "react-router-dom";
import { RequestChannelDialog } from "./RequestChannelDialog";
import { ChannelsGridSkeleton } from "./grid/ChannelsGridSkeleton";
import { ChannelDataProvider } from "./grid/ChannelDataProvider";
import { FilteredChannelsGrid } from "./grid/FilteredChannelsGrid";
import { useState } from "react";
import { Button } from "../ui/button";

interface ChannelsGridProps {
  onError?: (error: any) => void;
}

export const ChannelsGrid = ({ onError }: ChannelsGridProps) => {
  const location = useLocation();
  const isMainPage = location.pathname === "/";
  const [isRequestChannelOpen, setIsRequestChannelOpen] = useState(false);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 md:px-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-3 md:mb-6">
        <h2 className="text-base md:text-2xl font-bold text-black">View All Channels</h2>
        <Button variant="outline" onClick={() => setIsRequestChannelOpen(true)}>
          Request a Channel
        </Button>
        <RequestChannelDialog
          open={isRequestChannelOpen}
          onOpenChange={setIsRequestChannelOpen}
        />
      </div>
      
      <ChannelDataProvider onError={onError}>
        {({ displayChannels, isLoading }) => {
          // Show skeleton only when explicitly loading and not on main page
          const showSkeleton = isLoading && !isMainPage;

          if (showSkeleton) {
            return <ChannelsGridSkeleton />;
          }

          return <FilteredChannelsGrid 
            channels={displayChannels} 
            isMainPage={isMainPage}
            isLoading={isLoading}  // Pass loading state to FilteredChannelsGrid
          />;
        }}
      </ChannelDataProvider>
    </div>
  );
};
