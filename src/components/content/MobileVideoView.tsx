
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
}

export const MobileVideoView: React.FC<MobileVideoViewProps> = ({
  videos,
  isLoading,
  isRefreshing,
  refetch,
  forceRefetch
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

  // For a cleaner experience, let's use our loading component
  if (isLoading || isRefreshing) {
    return (
      <div className="space-y-1 px-4">
        <DelayedLoadingAnimation
          size="small"
          text={isRefreshing ? "Refreshing videos..." : "Loading videos..."}
          delayMs={3000}
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
        className="grid-cols-2 gap-2 px-4 max-w-[85%] mx-auto"
      />
      
      {totalPages > 1 && (
        <div className="mt-1 px-4">
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

      <div className="mt-2 px-4">
        <ChannelsGrid />
      </div>
    </div>
  );
};
