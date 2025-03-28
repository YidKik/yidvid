
import { VideoGrid } from "@/components/VideoGrid";
import { VideoGridPagination } from "@/components/video/VideoGridPagination";
import { MostViewedVideos } from "@/components/video/MostViewedVideos";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";
import { VideoData } from "@/hooks/video/useVideoFetcher";
import { useVideoPagination } from "@/hooks/video/useVideoPagination";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

interface DesktopVideoViewProps {
  videos: VideoData[];
  isLoading: boolean;
  isRefreshing: boolean;
  refetch?: () => Promise<any>;
  forceRefetch?: () => Promise<any>;
  lastSuccessfulFetch?: Date | null;
  fetchAttempts?: number;
}

export const DesktopVideoView = ({
  videos,
  isLoading,
  isRefreshing,
  refetch,
  forceRefetch
}: DesktopVideoViewProps) => {
  // Determine rowSize based on screen width
  const getRowSize = () => {
    if (window.innerWidth >= 640 && window.innerWidth < 1024) return 3; // Tablet
    return 4; // Desktop
  };

  const [rowSize, setRowSize] = useState(getRowSize());
  const videosPerPage = rowSize * 3; // Always show 3 rows 
  const location = useLocation();
  const isMainPage = location.pathname === "/";
  
  // Update row size on window resize
  useEffect(() => {
    const handleResize = () => {
      setRowSize(getRowSize());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
  }, [videos, hasRealVideos, isLoading, isRefreshing, currentPage, totalPages, displayVideos.length]);

  // Dynamic CSS classes based on screen size
  const getGridClasses = () => {
    if (window.innerWidth >= 640 && window.innerWidth < 1024) {
      return "grid-cols-3 gap-3 tablet-content-animate";
    }
    return "grid-cols-4 gap-4";
  };

  return (
    <div className="space-y-6">
      <div className="video-grid relative">
        <VideoGrid 
          videos={displayVideos}
          maxVideos={videosPerPage}
          rowSize={rowSize}
          isLoading={isLoading || isRefreshing}
          className={getGridClasses()}
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
