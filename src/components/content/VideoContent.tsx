
import { useIsMobile } from "@/hooks/use-mobile";
import { useCallback, useState } from "react";
import { MobileVideoView } from "./MobileVideoView";
import { DesktopVideoView } from "./DesktopVideoView";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useRefetchControl } from "@/hooks/video/useRefetchControl";
import { AutoRefreshHandler } from "./AutoRefreshHandler";
import { clearApplicationCache } from "@/lib/query-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { DelayedLoadingAnimation } from "@/components/ui/DelayedLoadingAnimation";

interface VideoContentProps {
  videos: VideoData[];
  isLoading: boolean;
  error?: Error | null;
  refetch?: () => Promise<any>;
  forceRefetch?: () => Promise<any>;
  lastSuccessfulFetch?: Date | null;
  fetchAttempts?: number;
  networkOffline?: boolean;
}

export const VideoContent = ({ 
  videos, 
  isLoading, 
  error,
  refetch,
  forceRefetch,
  lastSuccessfulFetch,
  fetchAttempts,
  networkOffline = false
}: VideoContentProps) => {
  const { isMobile } = useIsMobile();
  const { 
    isRefreshing, 
    handleRefetch, 
    handleForceRefetch 
  } = useRefetchControl({ refetch, forceRefetch });
  
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  
  // Network error manual refresh handler
  const recoveryRefresh = useCallback(async () => {
    if (!forceRefetch || networkOffline) return;
    
    setIsManualRefreshing(true);
    
    try {
      // Clear cache first
      clearApplicationCache();
      toast.loading("Refreshing content...");
      
      // Short delay to let cache clear
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await forceRefetch();
      toast.success("Content refreshed successfully");
    } catch (err) {
      console.error("Recovery refresh failed:", err);
      toast.error("Refresh failed", {
        description: "Please check your connection and try again"
      });
    } finally {
      setIsManualRefreshing(false);
    }
  }, [forceRefetch, networkOffline]);
  
  // Check for network errors
  const isNetworkError = error && (
    error.message?.includes('fetch') || 
    error.message?.includes('network')
  );

  // Show loading state when data is loading or refreshing
  if (isLoading || isRefreshing) {
    return (
      <div className="flex items-center justify-center w-full py-12">
        <DelayedLoadingAnimation
          size={isMobile ? "small" : "large"}
          text={isRefreshing ? "Refreshing videos..." : "Loading videos..."}
          delayMs={1000} // Start showing sooner for better user experience
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Component to handle automatic refresh of stale content */}
      <AutoRefreshHandler
        videos={videos}
        isRefreshing={isRefreshing}
        lastSuccessfulFetch={lastSuccessfulFetch}
        forceRefetch={navigator.onLine ? forceRefetch : undefined}
      />
      
      {/* Network or repeated fetch failure notice */}
      {(isNetworkError || (fetchAttempts && fetchAttempts > 2)) && !isRefreshing && (
        <div className="my-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <h3 className="font-medium text-amber-800">
            {networkOffline 
              ? "You appear to be offline" 
              : "Having trouble loading content?"}
          </h3>
          <p className="text-amber-700 text-sm mb-3">
            {networkOffline
              ? "We're showing cached content while your connection is unavailable."
              : "We're encountering some difficulties refreshing the content."}
          </p>
          <Button 
            onClick={recoveryRefresh} 
            className="text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium py-1 px-3 rounded flex items-center gap-2"
            disabled={isManualRefreshing || networkOffline}
          >
            <RefreshCw size={14} className={isManualRefreshing ? "animate-spin" : ""} />
            {isManualRefreshing ? "Refreshing..." : "Refresh Content"}
          </Button>
        </div>
      )}
      
      {/* Responsive video view based on device */}
      {isMobile ? (
        <MobileVideoView
          videos={videos}
          isLoading={isLoading}
          error={error}
          isRefreshing={isRefreshing}
          refetch={handleRefetch}
          forceRefetch={handleForceRefetch}
          lastSuccessfulFetch={lastSuccessfulFetch}
          fetchAttempts={fetchAttempts || 0}
        />
      ) : (
        <DesktopVideoView
          videos={videos}
          isLoading={isLoading}
          error={error}
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
