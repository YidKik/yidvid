
import { useIsMobile } from "@/hooks/useIsMobile";
import { useState, useEffect } from "react";
import { MobileVideoView } from "./MobileVideoView";
import { DesktopVideoView } from "./DesktopVideoView";
import { VideoData } from "@/hooks/video/useVideoFetcher";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

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
  const isMobile = useIsMobile();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefetch = async () => {
    if (refetch) {
      console.log("Manual refresh triggered");
      setIsRefreshing(true);
      try {
        await refetch();
        toast.success("Content refreshed");
      } catch (error) {
        console.error("Error during manual refetch:", error);
      } finally {
        setTimeout(() => setIsRefreshing(false), 1000);
      }
    }
  };

  const handleForceRefetch = async () => {
    if (forceRefetch) {
      console.log("Force refresh triggered");
      setIsRefreshing(true);
      try {
        await forceRefetch();
        toast.success("Content completely refreshed with latest data");
      } catch (error) {
        console.error("Error during force refetch:", error);
      } finally {
        setTimeout(() => setIsRefreshing(false), 1000);
      }
    }
  };

  // Log data for debugging
  useEffect(() => {
    const isEmpty = !videos || videos.length === 0;
    
    if (isEmpty && !isLoading) {
      console.log("No videos data available, displaying empty state");
    } else {
      console.log(`Rendering VideoContent with ${videos?.length || 0} videos`);
      if (videos?.length > 0) {
        const mostRecent = new Date(videos[0].uploadedAt);
        console.log(`Most recent video: ${mostRecent.toLocaleString()}`);
      }
    }
  }, [videos, isLoading]);

  // Always show force fetch button and trigger automatic refresh if stale
  useEffect(() => {
    if (lastSuccessfulFetch && 
        (new Date().getTime() - new Date(lastSuccessfulFetch).getTime() > 86400000) && // More than 24 hours
        forceRefetch && !isRefreshing) {
      console.log("Content is stale (>24 hours). Triggering automatic refresh...");
      handleForceRefetch();
    }
  }, [lastSuccessfulFetch, forceRefetch, isRefreshing]);

  // Create sample videos for fallback if needed
  const createSampleVideos = (): VideoData[] => {
    const now = new Date();
    return Array(12).fill(null).map((_, i) => ({
      id: `sample-${i}`,
      video_id: `sample-vid-${i}`,
      title: `Sample Video ${i+1}`,
      thumbnail: '/placeholder.svg',
      channelName: "Sample Channel",
      channelId: "sample-channel",
      views: 1000 * (i+1),
      uploadedAt: new Date(now.getTime() - (i * 86400000)).toISOString(),
      category: "other",
      description: "This is a sample video until real content loads."
    }));
  };

  // Ensure we have videos to display
  const displayVideos = videos?.length ? videos : createSampleVideos();

  // Only show empty state if explicitly requested
  const showEmptyState = false;

  if (showEmptyState && (!videos || videos.length === 0) && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No videos available</h3>
        <p className="text-muted-foreground mb-6">We're getting your videos ready. Please check back later.</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div>
        <MobileVideoView
          videos={displayVideos}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          refetch={handleRefetch}
          forceRefetch={handleForceRefetch}
          lastSuccessfulFetch={lastSuccessfulFetch}
          fetchAttempts={fetchAttempts || 0}
        />
      </div>
    );
  }

  // Desktop view
  return (
    <div>
      <DesktopVideoView
        videos={displayVideos}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        refetch={handleRefetch}
        forceRefetch={handleForceRefetch}
        lastSuccessfulFetch={lastSuccessfulFetch}
        fetchAttempts={fetchAttempts || 0}
      />
    </div>
  );
};
