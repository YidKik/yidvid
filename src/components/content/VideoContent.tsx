
import { useIsMobile } from "@/hooks/useIsMobile";
import { useState, useEffect, useCallback } from "react";
import { MobileVideoView } from "./MobileVideoView";
import { DesktopVideoView } from "./DesktopVideoView";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useRefetchControl } from "@/hooks/video/useRefetchControl";
import { useSampleVideos } from "@/hooks/video/useSampleVideos";
import { AutoRefreshHandler } from "./AutoRefreshHandler";
import { VideoEmptyState } from "./VideoEmptyState";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { clearApplicationCache } from "@/lib/query-client";

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
  const { 
    isRefreshing, 
    handleRefetch, 
    handleForceRefetch 
  } = useRefetchControl({ refetch, forceRefetch });
  
  const { 
    createSampleVideos,
    hasOnlySampleVideos 
  } = useSampleVideos();

  // Delay the background refresh to prioritize showing UI first
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);
  const [showCacheButton, setShowCacheButton] = useState(false);

  // Actively trigger a refresh after component mount if we have no real videos
  const triggerContentRefresh = useCallback(() => {
    if (forceRefetch && !isRefreshing) {
      setHasAttemptedRefresh(true);
      console.log("Triggering content refresh due to sample-only videos");
      
      // Immediate refresh for better user experience
      forceRefetch().catch(err => {
        console.error("Error in force refresh:", err);
        // Show cache button if refresh fails
        setShowCacheButton(true);
      });
    }
  }, [forceRefetch, isRefreshing]);

  // If we have only sample videos, try to refresh real content ASAP
  useEffect(() => {
    if (!isLoading && !isRefreshing && hasOnlySampleVideos(videos) && !hasAttemptedRefresh) {
      console.log("Detected sample-only videos, scheduling refresh");
      
      // Quick timeout to let UI render first
      const timer = setTimeout(() => {
        triggerContentRefresh();
      }, 500); // Reduced time for faster content loading
      
      return () => clearTimeout(timer);
    }
  }, [videos, isLoading, isRefreshing, hasOnlySampleVideos, hasAttemptedRefresh, triggerContentRefresh]);

  // Show cache button if multiple fetch attempts fail
  useEffect(() => {
    if (fetchAttempts && fetchAttempts > 2 && hasOnlySampleVideos(videos)) {
      setShowCacheButton(true);
    }
  }, [fetchAttempts, videos, hasOnlySampleVideos]);

  // Handle clearing cache
  const handleClearCache = async () => {
    try {
      toast.loading("Clearing application cache...");
      await clearApplicationCache();
      
      toast.dismiss();
      toast.success("Cache cleared successfully");
      
      // Give a moment before trying to refresh
      setTimeout(() => {
        if (forceRefetch) {
          toast.loading("Refreshing content...");
          forceRefetch()
            .then(() => {
              toast.dismiss();
              toast.success("Content refreshed successfully");
              setShowCacheButton(false);
            })
            .catch(error => {
              console.error("Failed to refresh after cache clear:", error);
              toast.dismiss();
              toast.error("Failed to refresh content");
            });
        }
      }, 500);
    } catch (error) {
      console.error("Failed to clear cache:", error);
      toast.dismiss();
      toast.error("Failed to clear cache");
    }
  };

  // Always show some content immediately - prioritize UI rendering speed
  // Use limited sample videos if we absolutely have no real data
  const displayVideos = videos?.length ? videos : createSampleVideos(8);
  
  // Only show empty state if explicitly requested
  const showEmptyState = false;

  if (showEmptyState && (!videos || videos.length === 0) && !isLoading) {
    return (
      <VideoEmptyState 
        onRefresh={handleForceRefetch}
        isRefreshing={isRefreshing}
      />
    );
  }

  return (
    <div>
      {/* Component to handle automatic refresh of stale content */}
      <AutoRefreshHandler
        videos={displayVideos}
        isRefreshing={isRefreshing}
        lastSuccessfulFetch={lastSuccessfulFetch}
        forceRefetch={forceRefetch}
      />
      
      {/* Cache clearing button that appears when content can't be loaded */}
      {showCacheButton && (
        <div className="flex justify-center my-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
            onClick={handleClearCache}
            disabled={isRefreshing}
          >
            <RefreshCw className="h-4 w-4" />
            Clear Cache & Refresh Content
          </Button>
        </div>
      )}
      
      {/* Responsive video view based on device */}
      {isMobile ? (
        <MobileVideoView
          videos={displayVideos}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          refetch={handleRefetch}
          forceRefetch={handleForceRefetch}
          lastSuccessfulFetch={lastSuccessfulFetch}
          fetchAttempts={fetchAttempts || 0}
        />
      ) : (
        <DesktopVideoView
          videos={displayVideos}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          refetch={handleRefetch}
          forceRefetch={handleForceRefetch}
          lastSuccessfulFetch={lastSuccessfulFetch}
          fetchAttempts={fetchAttempts || 0}
        />
      )}
    </div>
  );
};
