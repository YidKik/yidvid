
import { VideoGrid } from "@/components/VideoGrid";
import { VideoGridPagination } from "@/components/video/VideoGridPagination";
import { MostViewedVideos } from "@/components/video/MostViewedVideos";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";
import { VideoData } from "@/hooks/video/useVideoFetcher";
import { useState } from "react";

interface MobileVideoViewProps {
  videos: VideoData[];
  isLoading: boolean;
  isRefreshing: boolean;
  refetch?: () => Promise<any>;
  lastSuccessfulFetch?: Date | null;
  fetchAttempts?: number;
}

export const MobileVideoView = ({
  videos,
  isLoading,
  isRefreshing,
  refetch
}: MobileVideoViewProps) => {
  const [showMoreMobile, setShowMoreMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 4;

  // Get ID of the first video before sorting
  const firstVideoId = videos?.[0]?.id;
  
  const sortedVideos = videos ? [...videos]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .filter(video => video.id !== firstVideoId) : [];

  const totalPages = Math.ceil(sortedVideos.length / videosPerPage);
  const displayVideos = !showMoreMobile 
    ? sortedVideos.slice(0, videosPerPage)
    : sortedVideos.slice((currentPage - 1) * videosPerPage, currentPage * videosPerPage);

  return (
    <div className="space-y-4 -mt-2">
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
    </div>
  );
};
