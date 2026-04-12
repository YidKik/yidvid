
import { useState } from "react";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useSessionManager } from "@/hooks/useSessionManager";
import { VideoContentDisplay } from "./VideoContentDisplay";
import { VideoRecoverySection } from "./VideoRecoverySection";
import { useVideoContentDisplay } from "./useVideoContentDisplay";
import { useVideoContentRefresh } from "@/hooks/video/useVideoContentRefresh";
import { RequestChannelDialog } from "@/components/youtube/RequestChannelDialog";
import { Plus } from "lucide-react";

interface VideoContentProps {
  videos: VideoData[];
  isLoading: boolean;
  refetch?: () => Promise<any>;
  forceRefetch?: () => Promise<any>;
  lastSuccessfulFetch?: Date | null;
  fetchAttempts?: number;
  selectedCategory?: string;
  sortBy?: string;
  viewChannels?: boolean;
}

export const VideoContent = ({ 
  videos, 
  isLoading, 
  refetch,
  forceRefetch,
  lastSuccessfulFetch,
  fetchAttempts,
  selectedCategory = "all",
  sortBy,
  viewChannels = false
}: VideoContentProps) => {
  const { session, isAuthenticated } = useSessionManager();
  const [isRequestChannelOpen, setIsRequestChannelOpen] = useState(false);
  
  // Hook for video display and refresh control
  const {
    displayVideos,
    isRefreshing,
    handleRefetch,
    handleForceRefetch
  } = useVideoContentDisplay({ videos, isLoading, refetch, forceRefetch });
  
  // Hook for refresh and recovery logic
  const { recoveryRefresh } = useVideoContentRefresh({
    videos,
    isLoading,
    isAuthenticated,
    forceRefetch
  });
  
  return (
    <div>
      {/* Recovery section for when we have trouble loading content */}
      <VideoRecoverySection 
        fetchAttempts={fetchAttempts || 0}
        isRefreshing={isRefreshing}
        onRecoveryRefresh={recoveryRefresh}
      />
      
      {/* Main video content display */}
      <VideoContentDisplay
        videos={displayVideos}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        refetch={refetch}
        forceRefetch={forceRefetch}
        lastSuccessfulFetch={lastSuccessfulFetch}
        fetchAttempts={fetchAttempts}
        handleRefetch={handleRefetch}
        handleForceRefetch={handleForceRefetch}
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        viewChannels={viewChannels}
      />

      {/* Subtle request channel button */}
      <div className="flex justify-center mt-8 mb-4">
        <button
          onClick={() => setIsRequestChannelOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground border border-border/50 hover:border-border rounded-full transition-all duration-200 hover:shadow-sm bg-transparent hover:bg-muted/50"
        >
          <Plus className="w-3.5 h-3.5" />
          Request a Channel
        </button>
      </div>
      <RequestChannelDialog
        open={isRequestChannelOpen}
        onOpenChange={setIsRequestChannelOpen}
      />
    </div>
  );
};
