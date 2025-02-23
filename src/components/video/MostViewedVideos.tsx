
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

export const MostViewedVideos = ({
  videos
}: MostViewedVideosProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextVideos, setNextVideos] = useState<typeof videos>([]);
  const isMobile = useIsMobile();
  const videosPerPage = isMobile ? 2 : 4;
  const AUTO_SLIDE_INTERVAL = 8000;
  
  // Sort videos by views in descending order and take only top 10
  const sortedVideos = [...videos]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10);

  const handleNext = () => {
    if (!sortedVideos.length) return;
    setIsTransitioning(true);
    const nextIndex = currentIndex + videosPerPage >= sortedVideos.length ? 0 : currentIndex + videosPerPage;
    setNextVideos(sortedVideos.slice(nextIndex, nextIndex + videosPerPage));
    setTimeout(() => {
      setCurrentIndex(nextIndex);
      setIsTransitioning(false);
    }, 1500);
  };

  const handlePrevious = () => {
    if (!sortedVideos.length) return;
    setIsTransitioning(true);
    const nextIndex = currentIndex - videosPerPage < 0 ? Math.max(0, sortedVideos.length - videosPerPage) : currentIndex - videosPerPage;
    setNextVideos(sortedVideos.slice(nextIndex, nextIndex + videosPerPage));
    setTimeout(() => {
      setCurrentIndex(nextIndex);
      setIsTransitioning(false);
    }, 1500);
  };

  useEffect(() => {
    if (sortedVideos.length) {
      const initialNextIndex = currentIndex + videosPerPage >= sortedVideos.length ? 0 : currentIndex + videosPerPage;
      setNextVideos(sortedVideos.slice(initialNextIndex, initialNextIndex + videosPerPage));
    }
  }, [videos]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (!isMobile && isAutoPlaying && sortedVideos.length > videosPerPage) {
      intervalId = setInterval(() => {
        handleNext();
      }, AUTO_SLIDE_INTERVAL);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAutoPlaying, currentIndex, sortedVideos.length, videosPerPage, isMobile]);

  const handleManualNavigation = (action: () => void) => {
    setIsAutoPlaying(false);
    action();
    setTimeout(() => setIsAutoPlaying(true), 15000);
  };

  if (!videos.length) return null;

  const displayVideos = sortedVideos.slice(currentIndex, currentIndex + videosPerPage);

  return (
    <div className="w-full max-w-[1200px] mx-auto mb-2 md:mb-8">
      <div className="bg-gradient-to-r from-[#F1F1F1] via-[#D3E4FD] to-[#F1F1F1] rounded-lg md:rounded-xl shadow-sm md:shadow-lg p-1.5 md:p-6">
        <div className="flex items-center gap-1.5 mb-1.5 md:mb-4 px-0.5 md:px-0">
          <h2 className="text-xs md:text-xl font-bold text-[#333333]">
            Most Watched
          </h2>
        </div>

        <div className="relative px-0.5 md:px-4">
          {currentIndex > 0 && (
            <button 
              onClick={() => handleManualNavigation(handlePrevious)} 
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-500 group"
              aria-label="Previous videos"
            >
              <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 text-[#555555]" />
            </button>
          )}

          <div className={isMobile ? "grid grid-cols-2 gap-3" : "grid grid-cols-4 gap-4"}>
            {displayVideos.map(video => (
              <div key={video.id} className="w-full">
                <VideoCard {...video} hideInfo={true} />
              </div>
            ))}
          </div>

          {currentIndex + videosPerPage < sortedVideos.length && (
            <button 
              onClick={() => handleManualNavigation(handleNext)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-500 group"
              aria-label="Next videos"
            >
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-[#555555]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
