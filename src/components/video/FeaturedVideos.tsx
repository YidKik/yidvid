import { VideoCard } from "../VideoCard";

interface FeaturedVideosProps {
  videos: any[];
  onVideoClick: (videoId: string) => void;
}

export const FeaturedVideos = ({ videos, onVideoClick }: FeaturedVideosProps) => {
  if (!videos.length) return null;

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 mb-8">
      <h2 className="text-xl font-semibold mb-4">Featured Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.slice(0, 2).map((video) => (
          <div key={video.id} onClick={() => onVideoClick(video.id)} className="w-full">
            <VideoCard {...video} />
          </div>
        ))}
      </div>
    </div>
  );
};