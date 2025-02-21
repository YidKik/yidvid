
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
  const videosPerPage = isMobile ? 4 : 12;
  
  const sortedVideos = videos ? [...videos].sort((a, b) => 
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  ) : [];

  const totalPages = Math.ceil(sortedVideos.length / videosPerPage);
  const startIndex = (currentPage - 1) * videosPerPage;
  const displayVideos = isMobile && !showMoreMobile 
    ? sortedVideos.slice(0, videosPerPage)
    : sortedVideos.slice(startIndex, startIndex + videosPerPage);

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="mt-2">
          <VideoGrid
            videos={displayVideos}
            maxVideos={displayVideos.length}
            rowSize={1}
            isLoading={isLoading}
            className="px-3 space-y-4"
          />

          {sortedVideos.length > 4 && (
            <div className="px-3">
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

        {sortedVideos.length > 0 && (
          <div className="mt-6 px-3">
            <MostViewedVideos videos={sortedVideos} />
          </div>
        )}
        
        <div className="mt-6 px-3">
          <ChannelsGrid onError={() => {
            console.error('Channel grid error');
          }} />
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="space-y-6">
      {sortedVideos.length > 0 && (
        <div>
          <MostViewedVideos videos={sortedVideos} />
        </div>
      )}

      <div className="video-grid relative">
        <VideoGrid 
          videos={displayVideos}
          maxVideos={videosPerPage}
          rowSize={4}
          isLoading={isLoading}
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
      
      <div className="mt-6">
        <ChannelsGrid onError={() => {
          console.error('Channel grid error');
        }} />
      </div>
    </div>
  );
};
