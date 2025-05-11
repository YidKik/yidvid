
import React from 'react';
import { VideoGrid } from "@/components/VideoGrid";
import { VideoGridPagination } from "@/components/video/VideoGridPagination";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useVideoPagination } from "@/hooks/video/useVideoPagination";
import { useIsMobile } from "@/hooks/use-mobile";
import { DelayedLoadingAnimation } from "@/components/ui/DelayedLoadingAnimation";

export interface MobileVideoViewProps {
  videos: VideoData[];
  isLoading: boolean;
  isRefreshing: boolean;
  refetch?: () => Promise<any>;
  forceRefetch?: () => Promise<any>;
  lastSuccessfulFetch?: Date | null;
  fetchAttempts?: number;
  error?: Error | null;
}

export const MobileVideoView: React.FC<MobileVideoViewProps> = ({
  videos,
  isLoading,
  isRefreshing,
  refetch,
  forceRefetch,
  error
}) => {
  const { isMobile } = useIsMobile();
  
  // Set to exactly 4 videos (2 rows of 2 videos) for mobile
  const videosPerPage = 4; 
  const rowSize = 2;
  
  const {
    sortedVideos,
    displayVideos,
    currentPage,
    totalPages,
    setCurrentPage,
    showMoreMobile,
    setShowMoreMobile
  } = useVideoPagination({
    videos,
    videosPerPage,
    isMobile: true
  });

  // Show loading animation for better user experience
  if (isLoading || isRefreshing) {
    return (
      <div className="space-y-1">
        <DelayedLoadingAnimation
          size="small"
          text={isRefreshing ? "Refreshing videos..." : "Loading videos..."}
          delayMs={1000} // Show sooner for faster perceived performance
        />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <VideoGrid 
        videos={displayVideos}
        maxVideos={videosPerPage}
        rowSize={rowSize}
        isLoading={isLoading || isRefreshing}
        error={error}
        onRetry={forceRefetch}
        className="grid-cols-2 gap-1"
      />
      
      {totalPages > 1 && (
        <div className="mt-1">
          <VideoGridPagination
            showAll={showMoreMobile}
            currentPage={currentPage}
            totalPages={totalPages}
            filteredVideosLength={sortedVideos.length}
            maxVideos={videosPerPage}
            isMobile={true}
            onShowAll={() => setShowMoreMobile(true)}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      <div className="mt-2">
        <ChannelsGrid />
      </div>
    </div>
  );
};
