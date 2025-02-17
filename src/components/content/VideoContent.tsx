
import { VideoGrid } from "@/components/VideoGrid";
import { MostViewedVideos } from "@/components/video/MostViewedVideos";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";
import { useIsMobile } from "@/hooks/useIsMobile";
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
  const sortedVideos = videos ? [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)) : [];

  return (
    <div className="space-y-3 md:space-y-6">
      {isMobile ? (
        <div className="pb-4">
          <div className="grid grid-cols-2 gap-2 px-2">
            {videos?.slice(0, 4).map((video) => (
              <div key={video.id}>
                <VideoGrid
                  videos={[video]}
                  maxVideos={1}
                  rowSize={1}
                  isLoading={isLoading}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="video-grid relative">
          <VideoGrid 
            videos={videos} 
            maxVideos={12} 
            rowSize={4} 
            isLoading={isLoading}
          />
        </div>
      )}
      
      {sortedVideos.length > 0 && isMobile && (
        <div className="mt-3">
          <h2 className="text-base font-semibold mb-2 px-2">Most Viewed</h2>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 px-2 pb-2">
              {sortedVideos.slice(0, 3).map((video) => (
                <div key={video.id} className="w-[calc(100vw-140px)] min-w-[240px] flex-shrink-0">
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

      {sortedVideos.length > 0 && !isMobile && (
        <div className="mt-8">
          <MostViewedVideos videos={sortedVideos} />
        </div>
      )}
      
      <div className={`${isMobile ? 'mt-3' : 'mt-8'}`}>
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
