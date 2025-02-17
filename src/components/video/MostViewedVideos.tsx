
import { useState, useEffect } from "react";
import { VideoCard } from "../VideoCard";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
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
  const videosPerPage = isMobile ? 2 : 4;
  const AUTO_SLIDE_INTERVAL = 5000;

  // Sort videos by view count in descending order
  const sortedVideos = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0));

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + videosPerPage >= sortedVideos.length ? 0 : prevIndex + videosPerPage
    );
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - videosPerPage < 0 ? Math.max(0, sortedVideos.length - videosPerPage) : prevIndex - videosPerPage
    );
  };

  // Auto-sliding effect (now works on all devices)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isAutoPlaying && sortedVideos.length > videosPerPage) {
      intervalId = setInterval(() => {
        handleNext();
      }, AUTO_SLIDE_INTERVAL);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAutoPlaying, currentIndex, sortedVideos.length, videosPerPage]);

  // Pause auto-sliding when user interacts with navigation
  const handleManualNavigation = (action: () => void) => {
    setIsAutoPlaying(false);
    action();
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentVideos = sortedVideos.slice(currentIndex, currentIndex + videosPerPage);

  if (!sortedVideos.length) return null;

  return (
    <div className="w-full max-w-[1200px] mx-auto mb-8">
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl shadow-lg p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-primary animate-pulse" />
          <h2 className="text-base md:text-xl font-bold text-accent">
            Trending Now
          </h2>
        </div>

        <div className="relative px-2 md:px-4">
          <button
            onClick={() => handleManualNavigation(handlePrevious)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-300 group"
            style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-primary group-hover:scale-110 transition-transform" />
          </button>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {currentVideos.map((video, index) => (
              <div 
                key={video.id} 
                className="group relative rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl animate-scaleIn"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="relative aspect-video">
                  <VideoCard {...video} />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => handleManualNavigation(handleNext)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-300 group"
            style={{ opacity: currentIndex + videosPerPage >= sortedVideos.length ? 0.5 : 1 }}
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-primary group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <div className="flex justify-center mt-4 gap-1">
          {Array.from({ length: Math.ceil(sortedVideos.length / videosPerPage) }).map((_, idx) => (
            <button
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                Math.floor(currentIndex / videosPerPage) === idx 
                  ? 'bg-primary scale-125' 
                  : 'bg-primary/20 hover:bg-primary/40'
              }`}
              onClick={() => setCurrentIndex(idx * videosPerPage)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
