
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
      setIsRefreshing(true);
      await refetch();
      setTimeout(() => setIsRefreshing(false), 1000);
      return;
    }
  };

  if (isMobile) {
    return (
      <MobileVideoView
        videos={videos}
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
      videos={videos}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      refetch={handleRefetch}
      lastSuccessfulFetch={lastSuccessfulFetch}
      fetchAttempts={fetchAttempts || 0}
    />
  );
};
