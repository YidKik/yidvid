
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextVideos, setNextVideos] = useState<typeof videos>([]);
  const isMobile = useIsMobile();
  const videosPerPage = isMobile ? 2 : 4;
  const AUTO_SLIDE_INTERVAL = 8000;

  const sortedVideos = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0));

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
    const nextIndex = currentIndex - videosPerPage < 0 ? 
      Math.max(0, sortedVideos.length - videosPerPage) : 
      currentIndex - videosPerPage;
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

  const handleManualNavigation = (action: () => void) => {
    setIsAutoPlaying(false);
    action();
    setTimeout(() => setIsAutoPlaying(true), 15000);
  };

  const currentVideos = sortedVideos.slice(currentIndex, currentIndex + videosPerPage);

  if (!sortedVideos.length) return null;

  return (
    <div className="w-full max-w-[1200px] mx-auto mb-8">
      <div className="bg-gradient-to-r from-[#F1F1F1] via-[#D3E4FD] to-[#F1F1F1] rounded-xl shadow-lg p-4 md:p-6 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-primary animate-pulse" />
          <h2 className="text-base md:text-xl font-bold text-[#333333]">
            Featured Videos
          </h2>
        </div>

        <div className="relative px-2 md:px-4">
          <button
            onClick={() => handleManualNavigation(handlePrevious)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-500 group"
            style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-[#555555] group-hover:scale-110 transition-transform duration-500" />
          </button>

          <div className="relative overflow-hidden min-h-[200px]">
            <div 
              className={`grid grid-cols-${isMobile ? '2' : '4'} gap-3 md:gap-6 absolute w-full top-0 left-0`}
              style={{
                opacity: isTransitioning ? 0 : 1,
                transition: 'opacity 1.5s ease-in-out',
                pointerEvents: isTransitioning ? 'none' : 'auto'
              }}
            >
              {currentVideos.map((video) => (
                <div 
                  key={video.id} 
                  className="group relative rounded-lg overflow-hidden transition-all duration-700 hover:shadow-xl"
                >
                  <div className="relative aspect-video">
                    <VideoCard {...video} hideInfo={isMobile} />
                  </div>
                </div>
              ))}
            </div>

            {isTransitioning && (
              <div 
                className={`grid grid-cols-${isMobile ? '2' : '4'} gap-3 md:gap-6 absolute w-full top-0 left-0`}
                style={{
                  opacity: isTransitioning ? 1 : 0,
                  transition: 'opacity 1.5s ease-in-out',
                  pointerEvents: isTransitioning ? 'auto' : 'none'
                }}
              >
                {nextVideos.map((video) => (
                  <div 
                    key={video.id} 
                    className="group relative rounded-lg overflow-hidden transition-all duration-700 hover:shadow-xl"
                  >
                    <div className="relative aspect-video">
                      <VideoCard {...video} hideInfo={isMobile} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => handleManualNavigation(handleNext)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-500 group"
            style={{ opacity: currentIndex + videosPerPage >= sortedVideos.length ? 0.5 : 1 }}
            disabled={currentIndex + videosPerPage >= sortedVideos.length}
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-[#555555] group-hover:scale-110 transition-transform duration-500" />
          </button>
        </div>

        <div className="flex justify-center mt-4 gap-1">
          {Array.from({ length: Math.ceil(sortedVideos.length / videosPerPage) }).map((_, idx) => (
            <button
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-700 ${
                Math.floor(currentIndex / videosPerPage) === idx 
                  ? 'bg-[#555555] scale-125' 
                  : 'bg-[#888888]/20 hover:bg-[#888888]/40'
              }`}
              onClick={() => setCurrentIndex(idx * videosPerPage)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
