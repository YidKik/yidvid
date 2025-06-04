
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
  
  // Use 6 videos (3 rows of 2 videos) for mobile instead of just 4
  const videosPerPage = 6; 
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
    <div className="space-y-2">
      <VideoGrid 
        videos={displayVideos}
        maxVideos={videosPerPage}
        rowSize={rowSize}
        isLoading={isLoading || isRefreshing}
        className="grid-cols-2 gap-3 px-1 max-w-[98%] mx-auto mobile-view"
      />
      
      {totalPages > 1 && (
        <div className="mt-2 px-4 flex justify-center">
          <VideoGridPagination
            showAll={false}  // Always use pagination arrows instead of "Show All"
            currentPage={currentPage}
            totalPages={totalPages}
            filteredVideosLength={sortedVideos.length}
            maxVideos={videosPerPage}
            isMobile={true}
            onShowAll={() => {}} // We don't need this functionality anymore
            onPageChange={(page) => setCurrentPage(page)}
            usePaginationArrows={true} // Add this prop to force arrow pagination
          />
        </div>
      )}

      <div className="mt-4 px-2">
        <ChannelsGrid />
      </div>
    </div>
  );
};
