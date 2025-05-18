
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useSessionManager } from "@/hooks/useSessionManager";
import { VideoContentDisplay } from "./VideoContentDisplay";
import { VideoRecoverySection } from "./VideoRecoverySection";
import { useVideoContentDisplay } from "./useVideoContentDisplay";
import { useVideoContentRefresh } from "@/hooks/video/useVideoContentRefresh";

interface VideoContentProps {
  videos: VideoData[];
  isLoading: boolean;
  refetch?: () => Promise<any>;
  forceRefetch?: () => Promise<any>;
  lastSuccessfulFetch?: Date | null;
  fetchAttempts?: number;
}

export const VideoContent = ({ 
  videos, 
  isLoading, 
  refetch,
  forceRefetch,
  lastSuccessfulFetch,
  fetchAttempts
}: VideoContentProps) => {
  const { session, isAuthenticated } = useSessionManager();
  
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
      />
    </div>
  );
};
