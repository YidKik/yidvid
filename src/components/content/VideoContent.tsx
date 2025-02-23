
import { VideoGrid } from "@/components/VideoGrid";

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
  return (
    <div className="container mx-auto px-4 md:px-6">
      <VideoGrid
        videos={videos}
        maxVideos={12}
        rowSize={4}
        isLoading={isLoading}
        className="grid-cols-2 md:grid-cols-4 gap-4"
      />
    </div>
  );
};
