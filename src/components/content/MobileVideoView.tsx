
import { VideoGrid } from "@/components/VideoGrid";
import { VideoGridPagination } from "@/components/video/VideoGridPagination";
import { MostViewedVideos } from "@/components/video/MostViewedVideos";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";
import { VideoData } from "@/hooks/video/useVideoFetcher";
import { useVideoPagination } from "@/hooks/video/useVideoPagination";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

interface MobileVideoViewProps {
  videos: VideoData[];
  isLoading: boolean;
  isRefreshing: boolean;
  refetch?: () => Promise<any>;
  forceRefetch?: () => Promise<any>;
  lastSuccessfulFetch?: Date | null;
  fetchAttempts?: number;
}

export const MobileVideoView = ({
  videos,
  isLoading,
  isRefreshing,
  refetch,
  forceRefetch
}: MobileVideoViewProps) => {
  const videosPerPage = 4;
  const location = useLocation();
  const isMainPage = location.pathname === "/";
  
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

  // More thorough check if we have real videos (not samples)
  const hasRealVideos = videos.some(video => 
    !video.id.toString().includes('sample') && 
    !video.video_id.includes('sample') &&
    video.channelName !== "Sample Channel" &&
    video.title !== "Sample Video 1"
  );

  // Log for debugging
  useEffect(() => {
    console.log(`MobileVideoView: ${videos.length} videos, hasRealVideos: ${hasRealVideos}, isLoading: ${isLoading}, isRefreshing: ${isRefreshing}`);
    console.log(`Pagination: currentPage ${currentPage} of ${totalPages}, showing ${displayVideos.length} videos`);
  }, [videos, hasRealVideos, isLoading, isRefreshing, currentPage, totalPages, displayVideos.length]);

  return (
    <div className="space-y-4 -mt-2 pt-8">
      <div>
        <VideoGrid
          videos={displayVideos}
          maxVideos={displayVideos.length}
          rowSize={2}
          isLoading={isLoading || isRefreshing}
          className="grid-cols-2 gap-3 px-2"
        />

        {sortedVideos.length > 4 && (
          <div className="px-2 mt-2">
            <VideoGridPagination
              showAll={showMoreMobile}
              currentPage={currentPage}
              totalPages={totalPages}
              filteredVideosLength={sortedVideos.length}
              maxVideos={4}
              isMobile={true}
              onShowAll={() => {
                setShowMoreMobile(true);
                setCurrentPage(1);
              }}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      <div className="mt-6">
        <MostViewedVideos videos={sortedVideos} />
      </div>
      
      <div className="mt-6 px-2 pb-20">
        <ChannelsGrid onError={() => {
          console.error('Channel grid error');
        }} />
      </div>

      {!hasRealVideos && !isLoading && !isRefreshing && !isMainPage && (
        <div className="flex justify-center mt-4 mb-6">
          <button 
            onClick={() => forceRefetch && forceRefetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Refresh Content
          </button>
        </div>
      )}
    </div>
  );
};
