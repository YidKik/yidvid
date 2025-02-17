
import { VideoGrid } from "@/components/VideoGrid";
import { MostViewedVideos } from "@/components/video/MostViewedVideos";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

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
  const sortedVideos = videos ? [...videos].sort((a, b) => 
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  ) : [];

  if (isMobile) {
    const displayVideos = showMoreMobile ? sortedVideos : sortedVideos.slice(0, 6);

    return (
      <div className="space-y-4">
        <VideoGrid
          videos={displayVideos}
          maxVideos={displayVideos.length}
          rowSize={2}
          isLoading={isLoading}
          className="px-2"
        />

        {sortedVideos.length > 6 && !showMoreMobile && (
          <div className="flex justify-center mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowMoreMobile(true)}
              className="w-full max-w-[200px] h-9 text-sm"
            >
              See More
            </Button>
          </div>
        )}
        
        {sortedVideos.length > 0 && (
          <div className="mt-6">
            <h2 className="text-base font-semibold mb-2 px-2">Most Viewed</h2>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 px-2 pb-2">
                {sortedVideos
                  .sort((a, b) => (b.views || 0) - (a.views || 0))
                  .slice(0, 3)
                  .map((video) => (
                    <div key={video.id} className="w-full min-w-[calc(50vw-24px)] flex-shrink-0">
                      <VideoGrid
                        videos={[video]}
                        maxVideos={1}
                        rowSize={1}
                        isLoading={false}
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <ChannelsGrid onError={(error: any) => {
            console.error('Channel grid error:', error);
            if (error?.status === 429) {
              toast.warning('YouTube API quota exceeded. Some content may be temporarily unavailable.');
            } else {
              toast.error('Unable to fetch channels. Please try again later.');
            }
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="video-grid relative">
        <VideoGrid 
          videos={videos} 
          maxVideos={12} 
          rowSize={4} 
          isLoading={isLoading}
        />
      </div>
      
      {sortedVideos.length > 0 && (
        <div className="mt-8">
          <MostViewedVideos videos={sortedVideos} />
        </div>
      )}
      
      <div className="mt-8">
        <ChannelsGrid onError={(error: any) => {
          console.error('Channel grid error:', error);
          if (error?.status === 429) {
            toast.warning('YouTube API quota exceeded. Some content may be temporarily unavailable.');
          } else {
            toast.error('Unable to fetch channels. Please try again later.');
          }
        }} />
      </div>
    </div>
  );
};

