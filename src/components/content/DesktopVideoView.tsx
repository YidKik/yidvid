import { VideoGrid } from "@/components/VideoGrid";
import { VideoGridPagination } from "@/components/video/VideoGridPagination";
import { MostViewedVideos } from "@/components/video/MostViewedVideos";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";
import { VideoData } from "@/hooks/video/useVideoFetcher";
import { useVideoPagination } from "@/hooks/video/useVideoPagination";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

interface DesktopVideoViewProps {
  videos: VideoData[];
  isLoading: boolean;
  isRefreshing: boolean;
  refetch?: () => Promise<any>;
  forceRefetch?: () => Promise<any>;
  lastSuccessfulFetch?: Date | null;
  fetchAttempts?: number;
  isTablet?: boolean;
}

export const DesktopVideoView = ({
  videos,
  isLoading,
  isRefreshing,
  refetch,
  forceRefetch,
  isTablet = false
}: DesktopVideoViewProps) => {
  // For tablets, show 6 videos (2 rows of 3)
  // For regular desktop, show 12 videos (3 rows of 4)
  const videosPerPage = isTablet ? 6 : 12;
  const rowSize = isTablet ? 3 : 4;
  
  const location = useLocation();
  const isMainPage = location.pathname === "/";
  
  const {
    sortedVideos,
    displayVideos,
    currentPage,
    totalPages,
    setCurrentPage
  } = useVideoPagination({
    videos,
    videosPerPage
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
    console.log(`DesktopVideoView: ${videos.length} videos, hasRealVideos: ${hasRealVideos}, isLoading: ${isLoading}, isRefreshing: ${isRefreshing}`);
    console.log(`Pagination: currentPage ${currentPage} of ${totalPages}, showing ${displayVideos.length} videos`);
    console.log(`Device type: isTablet=${isTablet}, videosPerPage=${videosPerPage}, rowSize=${rowSize}`);
  }, [videos, hasRealVideos, isLoading, isRefreshing, currentPage, totalPages, displayVideos.length, isTablet, videosPerPage, rowSize]);

  return (
    <div className="space-y-6">
      <div className="video-grid relative">
        <VideoGrid 
          videos={displayVideos}
          maxVideos={videosPerPage}
          rowSize={rowSize}
          isLoading={isLoading || isRefreshing}
          className={isTablet ? "grid-cols-3 gap-4" : "grid-cols-4 gap-4"}
        />
        
        {sortedVideos.length > 0 && (
          <VideoGridPagination
            showAll={true}
            currentPage={currentPage}
            totalPages={totalPages}
            filteredVideosLength={sortedVideos.length}
            maxVideos={videosPerPage}
            onShowAll={() => setCurrentPage(1)}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {sortedVideos.length > 0 && (
        <div>
          <MostViewedVideos videos={sortedVideos} />
        </div>
      )}
      
      <div className="mt-6">
        <ChannelsGrid onError={() => {
          console.error('Channel grid error');
        }} />
      </div>

      {!hasRealVideos && !isLoading && !isRefreshing && !isMainPage && (
        <div className="flex justify-center mt-6">
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
