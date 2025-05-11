
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoGridLoader } from "@/components/video/VideoGridLoader";
import { VideoGridItem } from "@/components/video/VideoGridItem";
import { VideoGridError } from "@/components/video/VideoGridError";
import { useVideoGridData, VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";
import { filterUnavailableVideos } from "@/hooks/video/utils/validation";
import { memo, useCallback } from "react";

interface VideoGridProps {
  videos?: VideoItemType[];
  maxVideos?: number;
  rowSize?: number;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => Promise<any>;
  className?: string;
}

export const VideoGrid = memo(({
  videos: externalVideos,
  maxVideos = 12,
  rowSize = 4,
  isLoading: externalLoading,
  error: externalError,
  onRetry,
  className,
}: VideoGridProps) => {
  const { isMobile, isTablet } = useIsMobile();
  const { videos: fetchedVideos, loading: internalLoading, error: internalError } = useVideoGridData(maxVideos);
  
  // Use external videos if provided, otherwise use fetched videos
  let videos = externalVideos || fetchedVideos;
  
  // Filter out unavailable videos
  videos = filterUnavailableVideos(videos);
  
  // Determine loading state
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;
  
  // Use external error if provided, otherwise use internal error
  const error = externalError || internalError;
  
  // Determine if we have a network error
  const isNetworkError = error && (
    error.message?.includes('fetch') || 
    error.message?.includes('network')
  );

  // Handle retry with proper error handling
  const handleRetry = useCallback(async () => {
    if (!onRetry) return;
    
    try {
      await onRetry();
    } catch (retryError) {
      console.error("Error during retry:", retryError);
    }
  }, [onRetry]);

  // Show loader while loading
  if (isLoading && !videos?.length) {
    return <VideoGridLoader />;
  }

  // Handle errors when we have no videos to show
  if (error && !videos?.length) {
    return (
      <VideoGridError 
        message={isNetworkError ? "Network connection issue" : error.message} 
        onRetry={handleRetry}
        networkError={isNetworkError}
      />
    );
  }

  // Create grid columns based on device and rowSize
  let gridCols = "grid-cols-4"; // Default desktop
  
  if (isMobile) {
    gridCols = "grid-cols-2"; // Mobile always 2 columns
  } else if (isTablet) {
    gridCols = "grid-cols-3"; // Tablet always 3 columns
  }
  
  const gridGap = isMobile ? "gap-x-2 gap-y-4" : "gap-4";
  
  // Limit videos based on device
  const videoLimit = isMobile ? 4 : isTablet ? 9 : maxVideos;
  const displayVideos = videos?.slice(0, videoLimit) || [];

  // Show error notice above videos if we have videos but there was an error
  return (
    <div className={cn("space-y-4", className)}>
      {error && videos?.length > 0 && (
        <VideoGridError 
          message={isNetworkError ? "Limited connectivity - showing available videos" : "Showing limited content due to loading issues"} 
          onRetry={handleRetry}
          networkError={isNetworkError} 
        />
      )}
      
      <div className={cn("grid", gridCols, gridGap)}>
        {displayVideos.map((video) => (
          <VideoGridItem key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
});

export default VideoGrid;
