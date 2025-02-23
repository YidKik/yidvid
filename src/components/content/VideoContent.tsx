
import { VideoGrid } from "@/components/VideoGrid";
import { MostViewedVideos } from "@/components/video/MostViewedVideos";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useState } from "react";
import { VideoGridPagination } from "@/components/video/VideoGridPagination";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  
  // Get ID of the first video before sorting
  const firstVideoId = videos?.[0]?.id;
  
  const sortedVideos = videos ? [...videos]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .filter(video => video.id !== firstVideoId) : [];

  const totalPages = Math.ceil(sortedVideos.length / videosPerPage);
  const startIndex = (currentPage - 1) * videosPerPage;
  const displayVideos = isMobile && !showMoreMobile 
    ? sortedVideos.slice(0, videosPerPage)
    : sortedVideos.slice(startIndex, startIndex + videosPerPage);

  if (isMobile) {
    return (
      <div className="space-y-4 -mt-2">
        <Alert className="mb-4 mx-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>We're Aware of Video Loading Issues</AlertTitle>
          <AlertDescription>
            We're currently experiencing some technical difficulties with video fetching. Our team is working to resolve this as quickly as possible. Thank you for your patience.
          </AlertDescription>
        </Alert>

        <div>
          <VideoGrid
            videos={displayVideos}
            maxVideos={displayVideos.length}
            rowSize={2}
            isLoading={isLoading}
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
  }

  // Desktop view
  return (
    <div className="space-y-6">
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>We're Aware of Video Loading Issues</AlertTitle>
        <AlertDescription>
          We're currently experiencing some technical difficulties with video fetching. Our team is working to resolve this as quickly as possible. Thank you for your patience.
        </AlertDescription>
      </Alert>

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
