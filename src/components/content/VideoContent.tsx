
import { VideoGrid } from "@/components/VideoGrid";
import { MostViewedVideos } from "@/components/video/MostViewedVideos";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useState, useEffect } from "react";
import { VideoGridPagination } from "@/components/video/VideoGridPagination";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  refetch?: () => void;
  lastSuccessfulFetch?: Date | null;
  fetchAttempts?: number;
}

export const VideoContent = ({ videos, isLoading, refetch, lastSuccessfulFetch, fetchAttempts = 0 }: VideoContentProps) => {
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

  // Reset to first page when videos change
  useEffect(() => {
    setCurrentPage(1);
  }, [videos?.length]);

  const showAlert = fetchAttempts > 1 || videos.length === 0;
  const lastUpdateTime = lastSuccessfulFetch ? 
    new Intl.DateTimeFormat('en-US', { 
      dateStyle: 'short', 
      timeStyle: 'short' 
    }).format(lastSuccessfulFetch) : 'No recent update';

  if (isMobile) {
    return (
      <div className="space-y-4 -mt-2">
        {showAlert && (
          <Alert className="mb-4 mx-2" variant={fetchAttempts > 3 ? "destructive" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Video Loading Status</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              {fetchAttempts > 3 ? (
                "We're experiencing technical difficulties with video fetching. We'll keep trying automatically."
              ) : (
                "Some videos might not be loading correctly. We're working on it."
              )}
              <div className="text-xs opacity-80">Last update: {lastUpdateTime}</div>
              {refetch && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full mt-1 gap-2"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-3 w-3" />
                  Refresh Videos
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

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
      {showAlert && (
        <Alert className="mb-4" variant={fetchAttempts > 3 ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Video Loading Status</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <div>
              {fetchAttempts > 3 ? (
                "We're experiencing technical difficulties with our YouTube video fetching service. We'll keep trying automatically."
              ) : (
                "Some YouTube videos might not be loading correctly. Our team is working to resolve this as quickly as possible."
              )}
              <div className="text-xs opacity-80 mt-1">Last successful update: {lastUpdateTime}</div>
            </div>
            
            {refetch && (
              <Button 
                size="sm" 
                variant="outline" 
                className="ml-4 whitespace-nowrap gap-2"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className="h-3 w-3" />
                Refresh Videos
              </Button>
            )}
          </AlertDescription>
        </Alert>
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
