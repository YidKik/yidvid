
import { useLocation } from "react-router-dom";
import { RequestChannelDialog } from "./RequestChannelDialog";
import { ChannelsGridSkeleton } from "./grid/ChannelsGridSkeleton";
import { ChannelDataProvider } from "./grid/ChannelDataProvider";
import { FilteredChannelsGrid } from "./grid/FilteredChannelsGrid";
import { useState } from "react";
import { Button } from "../ui/button";

interface ChannelsGridProps {
  onError?: (error: any) => void;
  selectedCategory?: string;
}

export const ChannelsGrid = ({ onError, selectedCategory = "all" }: ChannelsGridProps) => {
  const location = useLocation();
  const isMainPage = location.pathname === "/";
  const [isRequestChannelOpen, setIsRequestChannelOpen] = useState(false);

  // Determine section title based on category
  const sectionTitle = selectedCategory === "all" 
    ? "View All Channels" 
    : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Channels`;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 md:px-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-3 md:mb-6">
        <h2 className="text-base md:text-2xl font-bold text-foreground">{sectionTitle}</h2>
        <Button 
          variant="outline" 
          onClick={() => setIsRequestChannelOpen(true)}
          className="rounded-full px-5 border-2 border-[#FFCC00] text-[#1A1A1A] hover:bg-[#FFCC00] hover:text-[#1A1A1A] hover:border-[#FFCC00] hover:shadow-md hover:scale-105 transition-all duration-200 font-medium"
        >
          Request a Channel
        </Button>
        <RequestChannelDialog
          open={isRequestChannelOpen}
          onOpenChange={setIsRequestChannelOpen}
        />
      </div>
      
      <ChannelDataProvider onError={onError} selectedCategory={selectedCategory}>
        {({ displayChannels, isLoading }) => {
          // Show skeleton only when explicitly loading and not on main page
          const showSkeleton = isLoading && !isMainPage;

          if (showSkeleton) {
            return <ChannelsGridSkeleton />;
          }

          return <FilteredChannelsGrid 
            channels={displayChannels} 
            isMainPage={isMainPage}
            isLoading={isLoading}
          />;
        }}
      </ChannelDataProvider>
    </div>
  );
};
