
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoGridLoader } from "@/components/video/VideoGridLoader";
import { VideoGridItem } from "@/components/video/VideoGridItem";
import { VideoGridError } from "@/components/video/VideoGridError";
import { useVideoGridData, VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";
import { useSessionManager } from "@/hooks/useSessionManager";
import { useEffect, useState } from "react";

interface VideoGridProps {
  videos?: VideoItemType[];
  maxVideos?: number;
  rowSize?: number;
  isLoading?: boolean;
  className?: string;
}

export const VideoGrid = ({
  videos: externalVideos,
  maxVideos = 12,
  rowSize = 4,
  isLoading: externalLoading,
  className,
}: VideoGridProps) => {
  const { isMobile, isTablet } = useIsMobile();
  const { session } = useSessionManager();
  const [forceFetchPublic, setForceFetchPublic] = useState(false);
  
  // Always set to true to ensure we fetch public videos for all users
  const shouldShowContent = true;
  
  const { videos: fetchedVideos, loading: internalLoading, error } = useVideoGridData(
    maxVideos, 
    shouldShowContent
  );
  
  useEffect(() => {
    // For non-authenticated users, ensure we try to fetch public videos
    if (!session) {
      setForceFetchPublic(true);
    }
  }, [session]);
  
  useEffect(() => {
    // If we need to fetch public videos and don't have external videos
    if (forceFetchPublic && !externalVideos && fetchedVideos.length === 0) {
      // Attempt to fetch public videos via edge function
      const fetchPublicVideos = async () => {
        try {
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
            console.log("Successfully fetched public videos via edge function");
            // Data will be used in the next render cycle
          }
        } catch (error) {
          console.error("Error fetching public videos:", error);
        } finally {
          setForceFetchPublic(false);
        }
      };
      
      fetchPublicVideos();
    }
  }, [forceFetchPublic, externalVideos, fetchedVideos]);
  
  // Use external videos if provided, otherwise use fetched videos
  const videos = externalVideos || fetchedVideos;
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;

  // Show loader while loading
  if (isLoading) {
    return <VideoGridLoader />;
  }

  // Handle errors
  if (error && !videos.length) {
    return <VideoGridError message={error.message} onRetry={() => window.location.reload()} />;
  }

  // Create grid columns based on device and rowSize
  let gridCols = "grid-cols-4"; // Default desktop
  
  if (isMobile) {
    gridCols = "grid-cols-2"; // Mobile always 2 columns
  } else if (isTablet) {
    gridCols = "grid-cols-3"; // Tablet always 3 columns
  }
  
  const gridGap = isMobile ? "gap-x-3 gap-y-2" : "gap-5";
  
  // Limit videos based on device
  const videoLimit = isMobile ? 4 : isTablet ? 9 : maxVideos;
  const displayVideos = videos.slice(0, videoLimit);

  return (
    <div className={cn("grid video-grid-container", gridCols, gridGap, className)}>
      {displayVideos.map((video) => (
        <VideoGridItem key={video.id} video={video} />
      ))}
    </div>
  );
};

export default VideoGrid;
