
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useCallback, useRef } from "react";
import { MobileVideoView } from "./MobileVideoView";
import { DesktopVideoView } from "./DesktopVideoView";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useRefetchControl } from "@/hooks/video/useRefetchControl";
import { useSampleVideos } from "@/hooks/video/useSampleVideos";
import { AutoRefreshHandler } from "./AutoRefreshHandler";
import { VideoEmptyState } from "./VideoEmptyState";
import { clearApplicationCache } from "@/lib/query-client";
import { toast } from "sonner";
import { useSessionManager } from "@/hooks/useSessionManager";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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
  
  const { 
    createSampleVideos,
    hasOnlySampleVideos 
  } = useSampleVideos();

  const { session, isAuthenticated } = useSessionManager();
  
  // Track if we've already attempted background refresh
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);
  const initialLoadAttemptMade = useRef(false);
  const userChangedRef = useRef(session?.user?.id);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  
  // Clean up any existing timeouts
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);
  
  // Handle auth state changes to trigger a video refresh
  useEffect(() => {
    if (userChangedRef.current !== session?.user?.id) {
      userChangedRef.current = session?.user?.id;
      console.log("User authentication state changed, refreshing videos...");
      
      if (forceRefetch && navigator.onLine) {
        // Clear any cached data first
        clearApplicationCache();
        
        // Short delay to let auth state fully update
        refreshTimeoutRef.current = setTimeout(() => {
          forceRefetch().catch(err => {
            console.error("Error refreshing after auth change:", err);
          });
        }, 1000);
      }
    }
  }, [session?.user?.id, forceRefetch, isAuthenticated]);
  
  // Add a check for infinite refresh loops
  useEffect(() => {
    // If we have a very high fetch attempt count, it likely indicates a loop
    if (fetchAttempts && fetchAttempts > 10) {
      // Check when we last recorded this issue
      const lastLoopDetection = localStorage.getItem('loopDetectionTime');
      const now = new Date().getTime();
      
      // Only show message once per hour
      if (!lastLoopDetection || (now - parseInt(lastLoopDetection) > 60 * 60 * 1000)) {
        console.warn("Detected potential refresh loop. Limiting refreshes to conserve resources.");
        toast.warning("Content refresh temporarily limited", {
          description: "We'll try again later",
          duration: 3000
        });
        localStorage.setItem('loopDetectionTime', now.toString());
      }
      
      // Don't trigger any more refreshes in this session
      setHasAttemptedRefresh(true);
    }
  }, [fetchAttempts]);

  // Actively trigger a refresh on first mount if needed (but only when online)
  useEffect(() => {
    if (!initialLoadAttemptMade.current && !isLoading && !isRefreshing && 
        forceRefetch && videos.length === 0 && navigator.onLine) {
      initialLoadAttemptMade.current = true;
      
      // Check refresh rate limits
      const lastInitialLoad = localStorage.getItem('lastInitialLoadTime');
      const now = new Date().getTime();
      
      // Limit to once every 30 seconds
      if (!lastInitialLoad || (now - parseInt(lastInitialLoad) > 30 * 1000)) {
        localStorage.setItem('lastInitialLoadTime', now.toString());
        console.log("No videos found on initial load, triggering fetch...");
        
        // Short delay to let UI render first
        refreshTimeoutRef.current = setTimeout(() => {
          forceRefetch().catch(err => {
            console.error("Error in initial fetch:", err);
            // Show helpful error message
            toast.error("Couldn't load videos", {
              description: "Please try refreshing the page",
              duration: 5000
            });
          });
        }, 1000);
      }
    }
  }, [isLoading, isRefreshing, forceRefetch, videos.length]);

  // Always show some content immediately, whether user is logged in or not
  const displayVideos = videos?.length ? videos : createSampleVideos(8);
  
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
  
  // Show a more user-friendly message for network errors
  const isNetworkError = error && (
    error.message?.includes('fetch') || 
    error.message?.includes('network')
  );
  
  return (
    <div className="space-y-4">
      {/* Component to handle automatic refresh of stale content */}
      <AutoRefreshHandler
        videos={displayVideos}
        isRefreshing={isRefreshing}
        lastSuccessfulFetch={lastSuccessfulFetch}
        forceRefetch={navigator.onLine ? forceRefetch : undefined}
      />
      
      {/* Network or repeated fetch failure notice */}
      {(isNetworkError || (fetchAttempts && fetchAttempts > 3)) && !isRefreshing && (
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
          videos={displayVideos}
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
          videos={displayVideos}
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
