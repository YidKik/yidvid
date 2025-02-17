
import { VideoGrid } from "@/components/VideoGrid";
import { MostViewedVideos } from "@/components/video/MostViewedVideos";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";
import { useIsMobile } from "@/hooks/use-mobile";
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
    <>
      <div className="video-grid">
        <VideoGrid 
          videos={videos} 
          maxVideos={isMobile ? 6 : 12} 
          rowSize={isMobile ? 2 : 4} 
          isLoading={isLoading}
        />
      </div>
      {sortedVideos.length > 0 && (
        <div className="mt-6">
          <MostViewedVideos videos={sortedVideos} />
        </div>
      )}
      <div className="channels-grid mt-6">
        <ChannelsGrid onError={(error) => {
          console.error('Channel grid error:', error);
          toast.error('Unable to fetch channels at the moment. Please try again later.');
        }} />
      </div>
    </>
  );
};
