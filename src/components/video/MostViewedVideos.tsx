
import { useState, useEffect } from "react";
import { VideoCard } from "../VideoCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const isMobile = useIsMobile();
  const videosPerPage = isMobile ? 2 : 3;
  const AUTO_SLIDE_INTERVAL = 5000; // 5 seconds

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

  // Auto-sliding effect (now works on all devices)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isAutoPlaying && videos.length > videosPerPage) {
      intervalId = setInterval(() => {
        handleNext();
      }, AUTO_SLIDE_INTERVAL);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAutoPlaying, currentIndex, videos.length, videosPerPage]);

  // Pause auto-sliding when user interacts with navigation
  const handleManualNavigation = (action: () => void) => {
    setIsAutoPlaying(false);
    action();
    // Resume auto-playing after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentVideos = videos.slice(currentIndex, currentIndex + videosPerPage);

  if (!videos.length) return null;

  return (
    <div className="w-full max-w-[1000px] mx-auto px-1 md:px-4 mb-2 md:mb-6">
      <h2 className="text-sm md:text-lg font-bold mb-1 md:mb-3 text-accent px-1 md:px-0">
        Most Viewed Videos
      </h2>
      <div className="relative">
        <ChevronLeft 
          className="absolute left-0 md:left-1 top-[40%] -translate-y-1/2 z-10 w-4 h-4 md:w-5 md:h-5 text-primary hover:text-primary/80 cursor-pointer"
          onClick={() => handleManualNavigation(handlePrevious)}
          style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-6 w-full px-1 md:px-12">
          {currentVideos.map((video) => (
            <div 
              key={video.id} 
              className="w-full min-w-0 transition-all duration-300 animate-scaleIn"
            >
              <VideoCard {...video} />
            </div>
          ))}
        </div>

        <ChevronRight 
          className="absolute right-0 md:right-1 top-[40%] -translate-y-1/2 z-10 w-4 h-4 md:w-5 md:h-5 text-primary hover:text-primary/80 cursor-pointer"
          onClick={() => handleManualNavigation(handleNext)}
          style={{ opacity: currentIndex + videosPerPage >= videos.length ? 0.5 : 1 }}
        />
      </div>
    </div>
  );
};
