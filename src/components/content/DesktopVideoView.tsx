
import { VideoGrid } from "@/components/VideoGrid";
import { VideoGridPagination } from "@/components/video/VideoGridPagination";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useVideoPagination } from "@/hooks/video/useVideoPagination";
import { useIsMobile } from "@/hooks/use-mobile";
import { DelayedLoadingAnimation } from "@/components/ui/DelayedLoadingAnimation";

interface DesktopVideoViewProps {
  videos: VideoData[];
  isLoading: boolean;
  isRefreshing: boolean;
  refetch?: () => Promise<any>;
  forceRefetch?: () => Promise<any>;
  lastSuccessfulFetch?: Date | null;
  fetchAttempts?: number;
  error?: Error | null;
  progressiveLoading?: {
    firstPageLoaded: boolean;
    remainingPagesLoading: boolean;
  };
}

export const DesktopVideoView = ({
  videos,
  isLoading,
  isRefreshing,
  forceRefetch,
  error,
  progressiveLoading = { firstPageLoaded: false, remainingPagesLoading: true }
}: DesktopVideoViewProps) => {
  const { isTablet } = useIsMobile();
  
  // For tablet: 9 videos (3 rows of 3), For desktop: 12 videos (3 rows of 4)
  const videosPerPage = isTablet ? 9 : 12;
  const rowSize = isTablet ? 3 : 4;
  
  const {
    sortedVideos,
    displayVideos,
    currentPage,
    totalPages,
    setCurrentPage
  } = useVideoPagination({
    videos,
    videosPerPage,
    preloadNext: true,
    progressiveLoading
  });

  // Show loading animation when loading
  if (isLoading || isRefreshing) {
    return (
      <div className="flex items-center justify-center min-h-[400px] my-8">
        <DelayedLoadingAnimation
          size={isTablet ? "medium" : "large"}
          text={isRefreshing ? "Refreshing videos..." : "Loading videos..."}
          delayMs={500}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="video-grid relative">
        <VideoGrid 
          videos={displayVideos}
          maxVideos={videosPerPage}
          rowSize={rowSize}
          isLoading={isLoading || isRefreshing}
          error={error}
          onRetry={forceRefetch}
          className={`${isTablet ? 'grid-cols-3' : 'grid-cols-4'} gap-4`}
        />
        
        {totalPages > 1 && (
          <div className="mt-6">
            <VideoGridPagination
              showAll={true}
              currentPage={currentPage}
              totalPages={totalPages}
              filteredVideosLength={sortedVideos.length}
              maxVideos={videosPerPage}
              onShowAll={() => {}}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      <div className="mt-6">
        <ChannelsGrid onError={() => {
          console.error('Channel grid error');
        }} />
      </div>
    </div>
  );
};
