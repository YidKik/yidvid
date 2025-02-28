
import { VideoGrid } from "@/components/VideoGrid";
import { VideoGridPagination } from "@/components/video/VideoGridPagination";
import { MostViewedVideos } from "@/components/video/MostViewedVideos";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";
import { VideoAlertStatus } from "./VideoAlertStatus";
import { VideoData } from "@/hooks/video/useVideoFetcher";
import { useState, useEffect } from "react";

interface DesktopVideoViewProps {
  videos: VideoData[];
  isLoading: boolean;
  isRefreshing: boolean;
  refetch?: () => Promise<any>;
  lastSuccessfulFetch: Date | null;
  fetchAttempts: number;
}

export const DesktopVideoView = ({
  videos,
  isLoading,
  isRefreshing,
  refetch,
  lastSuccessfulFetch,
  fetchAttempts
}: DesktopVideoViewProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 12;
  
  // Get ID of the first video before sorting
  const firstVideoId = videos?.[0]?.id;
  
  const sortedVideos = videos ? [...videos]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .filter(video => video.id !== firstVideoId) : [];

  const totalPages = Math.ceil(sortedVideos.length / videosPerPage);
  const startIndex = (currentPage - 1) * videosPerPage;
  const displayVideos = sortedVideos.slice(startIndex, startIndex + videosPerPage);

  // Reset to first page when videos change
  useEffect(() => {
    setCurrentPage(1);
  }, [videos?.length]);

  return (
    <div className="space-y-6">
      <VideoAlertStatus
        isRefreshing={isRefreshing}
        fetchAttempts={fetchAttempts}
        lastSuccessfulFetch={lastSuccessfulFetch}
        refetch={refetch}
        isLoading={isLoading}
      />

      <div className="video-grid relative">
        <VideoGrid 
          videos={displayVideos}
          maxVideos={videosPerPage}
          rowSize={4}
          isLoading={isLoading || isRefreshing}
          className="grid-cols-4 gap-4"
        />
        
        {sortedVideos.length > videosPerPage && (
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
    </div>
  );
};
