
import { useIsMobile } from "@/hooks/useIsMobile";
import { useState, useEffect } from "react";
import { MobileVideoView } from "./MobileVideoView";
import { DesktopVideoView } from "./DesktopVideoView";
import { VideoData } from "@/hooks/video/useVideoFetcher";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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
        toast.error("Failed to refresh content");
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
        toast.error("Failed to refresh content");
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
        console.log("First video:", videos[0]);
      }
    }
  }, [videos, isLoading]);

  // Display a message if no videos and last fetch was more than a day ago
  const showForceFetchButton = lastSuccessfulFetch && 
    (new Date().getTime() - new Date(lastSuccessfulFetch).getTime() > 86400000) && // More than 24 hours
    forceRefetch;

  if (isMobile) {
    return (
      <div>
        {showForceFetchButton && (
          <div className="flex justify-center mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleForceRefetch} 
              disabled={isRefreshing} 
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} /> 
              Force Refresh
            </Button>
          </div>
        )}
        <MobileVideoView
          videos={videos || []}
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
      {showForceFetchButton && (
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleForceRefetch} 
            disabled={isRefreshing} 
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> 
            Force Refresh All Videos
          </Button>
        </div>
      )}
      <DesktopVideoView
        videos={videos || []}
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
