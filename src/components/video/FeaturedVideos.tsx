import { VideoCard } from "../VideoCard";

interface FeaturedVideosProps {
  videos: any[];
  onVideoClick: (videoId: string) => void;
}

export const FeaturedVideos = ({ videos, onVideoClick }: FeaturedVideosProps) => {
  if (!videos.length) return null;

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 mb-16 mt-12">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-accent">Featured Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {videos.slice(0, 2).map((video) => (
          <div key={video.id} onClick={() => onVideoClick(video.id)} className="w-full">
            <VideoCard {...video} />
          </div>
        ))}
      </div>
    </div>
  );
};