
import { useIsMobile } from "@/hooks/useIsMobile";
import { useState, useEffect } from "react";
import { MobileVideoView } from "./MobileVideoView";
import { DesktopVideoView } from "./DesktopVideoView";
import { VideoData } from "@/hooks/video/useVideoFetcher";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";

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
        // Don't show error toast
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
        // Don't show error toast
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

  // Always show force fetch button
  const showForceFetchButton = forceRefetch !== undefined;

  // Show empty state with refresh button if no videos
  if ((!videos || videos.length === 0) && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No videos available</h3>
        <p className="text-muted-foreground mb-6">We're getting your videos ready. Please try refreshing.</p>
        <Button 
          onClick={handleForceRefetch} 
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh All Videos
        </Button>
      </div>
    );
  }

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
              Refresh Videos
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
            Refresh All Videos
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
