import { useState } from "react";
import { VideoCard } from "../VideoCard";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MostViewedVideosProps {
  videos: {
    id: string;
    title: string;
    thumbnail: string;
    channelName: string;
    channelId: string;
    views: number;
    uploadedAt: string | Date;
  }[];
}

export const MostViewedVideos = ({ videos }: MostViewedVideosProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videosPerPage = 4;

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + videosPerPage >= videos.length ? 0 : prevIndex + videosPerPage
    );
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - videosPerPage < 0 ? Math.max(0, videos.length - videosPerPage) : prevIndex - videosPerPage
    );
  };

  const currentVideos = videos.slice(currentIndex, currentIndex + videosPerPage);

  if (!videos.length) return null;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 mb-12">
      <h2 className="text-2xl font-bold mb-8 text-accent">Most Viewed Videos</h2>
      <div className="relative">
        <ChevronLeft 
          className="absolute left-2 top-[40%] -translate-y-1/2 z-10 w-8 h-8 text-primary hover:text-primary/80 cursor-pointer"
          onClick={handlePrevious}
          style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
        />

        <div className="grid grid-cols-4 gap-4 w-full px-10">
          {currentVideos.map((video) => (
            <div key={video.id} className="transition-all duration-300 animate-scaleIn">
              <VideoCard {...video} />
            </div>
          ))}
        </div>

        <ChevronRight 
          className="absolute right-2 top-[40%] -translate-y-1/2 z-10 w-8 h-8 text-primary hover:text-primary/80 cursor-pointer"
          onClick={handleNext}
          style={{ opacity: currentIndex + videosPerPage >= videos.length ? 0.5 : 1 }}
        />
      </div>
    </div>
  );
};