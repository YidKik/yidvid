
import React from 'react';
import { VideoGrid } from "@/components/VideoGrid";
import { VideoGridPagination } from "@/components/video/VideoGridPagination";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useVideoPagination } from "@/hooks/video/useVideoPagination";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const videosPerPage = 6; // Increased from 4 to 6 videos per page
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

  return (
    <div className="space-y-1">
      <VideoGrid 
        videos={displayVideos}
        maxVideos={videosPerPage}
        rowSize={rowSize}
        isLoading={isLoading || isRefreshing}
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
