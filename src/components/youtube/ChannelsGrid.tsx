
import { useLocation } from "react-router-dom";
import { RequestChannelDialog } from "./RequestChannelDialog";
import { ChannelsGridSkeleton } from "./grid/ChannelsGridSkeleton";
import { ChannelDataProvider } from "./grid/ChannelDataProvider";
import { FilteredChannelsGrid } from "./grid/FilteredChannelsGrid";
import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { motion } from "framer-motion";

interface ChannelsGridProps {
  onError?: (error: any) => void;
}

export const ChannelsGrid = ({ onError }: ChannelsGridProps) => {
  const location = useLocation();
  const isMainPage = location.pathname === "/";
  const [isRequestChannelOpen, setIsRequestChannelOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="w-full max-w-[1400px] mx-auto mt-12 md:mt-16"
    >
      {/* Modern Section Header */}
      <div className="section-header-modern">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="section-title-modern">Browse Channels</h2>
            <p className="section-subtitle-modern hidden md:block">
              Discover content from trusted creators
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsRequestChannelOpen(true)}
          className="button-modern-secondary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Request Channel</span>
        </button>
        
        <RequestChannelDialog
          open={isRequestChannelOpen}
          onOpenChange={setIsRequestChannelOpen}
        />
      </div>
      
      <ChannelDataProvider onError={onError}>
        {({ displayChannels, isLoading }) => {
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
    </motion.div>
  );
};
