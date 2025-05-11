
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
      
      if (forceRefetch) {
        // Clear any cached data first
        clearApplicationCache();
        
        // Short delay to let auth state fully update
        refreshTimeoutRef.current = setTimeout(() => {
          forceRefetch().catch(err => {
            console.error("Error refreshing after auth change:", err);
          });
        }, 500);
      }
    }
  }, [session?.user?.id, forceRefetch, isAuthenticated]);
  
  // Add a check for infinite refresh loops
  useEffect(() => {
    // If we have a very high fetch attempt count, it likely indicates a loop
    if (fetchAttempts && fetchAttempts > 20) {
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

  // Actively trigger a refresh on first mount if needed
  useEffect(() => {
    if (!initialLoadAttemptMade.current && !isLoading && !isRefreshing && 
        forceRefetch && videos.length === 0) {
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
        }, 500);
      }
    }
  }, [isLoading, isRefreshing, forceRefetch, videos.length]);

  // Always ensure we have content for non-authenticated users by using edge function
  useEffect(() => {
    const fetchPublicVideos = async () => {
      if (!isAuthenticated && videos.length === 0 && !isLoading) {
        try {
          console.log("Fetching public videos for non-authenticated user");
          const response = await fetch(
            "https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-videos",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
              console.log("Successfully fetched public videos for non-authenticated user");
              // If we have refetch capability, use it to put videos in the cache
              if (forceRefetch) {
                forceRefetch();
              }
            }
          }
        } catch (error) {
          console.error("Error fetching public videos:", error);
        }
      }
    };
    
    fetchPublicVideos();
  }, [isAuthenticated, videos.length, isLoading, forceRefetch]);

  // Always show some content immediately, whether user is logged in or not
  const displayVideos = videos?.length ? videos : createSampleVideos(8);
  
  const recoveryRefresh = useCallback(() => {
    if (forceRefetch) {
      // Clear cache first
      clearApplicationCache();
      toast.loading("Refreshing content...");
      
      // Short delay to let cache clear
      setTimeout(() => {
        forceRefetch()
          .then(() => {
            toast.success("Content refreshed successfully");
          })
          .catch(err => {
            console.error("Recovery refresh failed:", err);
            toast.error("Refresh failed", {
              description: "Please try signing out and back in"
            });
          });
      }, 500);
    }
  }, [forceRefetch]);
  
  return (
    <div>
      {/* Component to handle automatic refresh of stale content */}
      <AutoRefreshHandler
        videos={displayVideos}
        isRefreshing={isRefreshing}
        lastSuccessfulFetch={lastSuccessfulFetch}
        forceRefetch={forceRefetch}
      />
      
      {fetchAttempts && fetchAttempts > 3 && !isRefreshing && (
        <div className="my-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <h3 className="font-medium text-amber-800">Having trouble loading content?</h3>
          <p className="text-amber-700 text-sm mb-2">We're encountering some difficulties refreshing the content.</p>
          <button 
            onClick={recoveryRefresh} 
            className="text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium py-1 px-3 rounded"
          >
            Refresh Content
          </button>
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
