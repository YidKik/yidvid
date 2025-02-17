import { VideoGrid } from "@/components/VideoGrid";
import { MostViewedVideos } from "@/components/video/MostViewedVideos";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useState } from "react";
import { VideoGridPagination } from "@/components/video/VideoGridPagination";

interface Video {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
  views: number;
  uploadedAt: string | Date;
}

interface VideoContentProps {
  videos: Video[];
  isLoading: boolean;
}

export const VideoContent = ({ videos, isLoading }: VideoContentProps) => {
  const isMobile = useIsMobile();
  const [showMoreMobile, setShowMoreMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 4; // Changed from 6 to 4 (2 columns × 2 rows for mobile)
  
  const sortedVideos = videos ? [...videos].sort((a, b) => 
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  ) : [];

  if (isMobile) {
    const totalPages = Math.ceil(sortedVideos.length / videosPerPage);
    const startIndex = (currentPage - 1) * videosPerPage;
    const displayVideos = showMoreMobile 
      ? sortedVideos.slice(startIndex, startIndex + videosPerPage)
      : sortedVideos.slice(0, videosPerPage);

    return (
      <div className="space-y-4">
        <VideoGrid
          videos={displayVideos}
          maxVideos={displayVideos.length}
          rowSize={2}
          isLoading={isLoading}
          className="px-2"
        />

        {sortedVideos.length > 4 && (
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
        )}
        
        {sortedVideos.length > 0 && (
          <div className="mt-6">
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
  }

  // Desktop view remains unchanged
  const desktopVideos = sortedVideos.slice(0, 12);

  return (
    <div className="space-y-6">
      <div className="video-grid relative">
        <VideoGrid 
          videos={desktopVideos}
          maxVideos={12}
          rowSize={4}
          isLoading={isLoading}
          className="grid-cols-4"
        />
      </div>
      
      {sortedVideos.length > 0 && (
        <div className="mt-8">
          <MostViewedVideos videos={sortedVideos} />
        </div>
      )}
      
      <div className="mt-8">
        <ChannelsGrid onError={() => {
          console.error('Channel grid error');
        }} />
      </div>
    </div>
  );
};
