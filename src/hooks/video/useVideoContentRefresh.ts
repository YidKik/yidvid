
import { useCallback, useEffect, useRef, useState } from "react";
import { VideoData } from "./types/video-fetcher";
import { clearApplicationCache } from "@/lib/query-client";
import { toast } from "sonner";

interface UseVideoContentRefreshProps {
  videos: VideoData[];
  isLoading: boolean;
  isAuthenticated?: boolean;
  forceRefetch?: () => Promise<any>;
}

export const useVideoContentRefresh = ({
  videos,
  isLoading,
  isAuthenticated,
  forceRefetch
}: UseVideoContentRefreshProps) => {
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);
  const initialLoadAttemptMade = useRef(false);
  const userChangedRef = useRef<string | undefined>();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up any existing timeouts
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Actively trigger a refresh on first mount if needed
  useEffect(() => {
    if (!initialLoadAttemptMade.current && !isLoading && forceRefetch && videos.length === 0) {
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
  }, [isLoading, forceRefetch, videos.length]);

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

  return {
    hasAttemptedRefresh,
    setHasAttemptedRefresh,
    recoveryRefresh
  };
};
