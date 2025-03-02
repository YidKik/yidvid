
import { useIsMobile } from "@/hooks/useIsMobile";
import { useState } from "react";
import { MobileVideoView } from "./MobileVideoView";
import { DesktopVideoView } from "./DesktopVideoView";
import { VideoData } from "@/hooks/video/useVideoFetcher";

interface VideoContentProps {
  videos: VideoData[];
  isLoading: boolean;
  refetch?: () => void;
  lastSuccessfulFetch?: Date | null;
  fetchAttempts?: number;
}

export const VideoContent = ({ 
  videos, 
  isLoading, 
  refetch,
  lastSuccessfulFetch,
  fetchAttempts
}: VideoContentProps) => {
  const isMobile = useIsMobile();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefetch = async () => {
    if (refetch) {
      console.log("Manual refresh triggered");
      setIsRefreshing(true);
      try {
        await refetch();
      } catch (error) {
        console.error("Error during manual refetch:", error);
      } finally {
        setTimeout(() => setIsRefreshing(false), 1000);
      }
      return;
    }
  };

  // Use useEffect to log the received data for debugging
  const isEmpty = !videos || videos.length === 0;
  
  if (isEmpty && !isLoading) {
    console.log("No videos data available, displaying empty state");
  } else {
    console.log(`Rendering VideoContent with ${videos?.length || 0} videos`);
  }

  if (isMobile) {
    return (
      <MobileVideoView
        videos={videos || []}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        refetch={handleRefetch}
        lastSuccessfulFetch={lastSuccessfulFetch}
        fetchAttempts={fetchAttempts || 0}
      />
    );
  }

  // Desktop view
  return (
    <DesktopVideoView
      videos={videos || []}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      refetch={handleRefetch}
      lastSuccessfulFetch={lastSuccessfulFetch}
      fetchAttempts={fetchAttempts || 0}
    />
  );
};
