
import { useState, useEffect } from "react";
import { Sparkle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatePresence } from "framer-motion";
import { CustomPaginationArrow } from "@/components/ui/custom-pagination-arrow";
import { MostViewedVideosList } from "./MostViewedVideosList";
import { MostViewedVideosProps } from "./types/most-viewed-videos";

export const MostViewedVideos = ({ videos }: MostViewedVideosProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isMobile, isTablet, isDesktop } = useIsMobile();
  
  const videosPerPage = isMobile ? 1 : (isTablet ? 3 : 4);
  const AUTO_SLIDE_INTERVAL = 8000;
  
  const ensureVideosToDisplay = () => {
    if (videos && videos.length > 0) {
      return videos;
    }
    
    const now = new Date();
    return Array(10).fill(null).map((_, i) => ({
      id: `most-viewed-${i}`,
      title: `Most Viewed Sample ${i+1}`,
      thumbnail: '/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png',
      channelName: "Sample Channel",
      channelId: "sample-channel",
      views: 10000 - (i * 1000),
      uploadedAt: new Date(now.getTime() - (i * 86400000))
    }));
  };
  
  const sortedVideos = [...ensureVideosToDisplay()]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10);

  const handleNext = () => {
    if (!sortedVideos.length || isTransitioning) return;
    setIsTransitioning(true);
    const nextIndex = currentIndex + videosPerPage >= sortedVideos.length ? 0 : currentIndex + videosPerPage;
    setCurrentIndex(nextIndex);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handlePrevious = () => {
    if (!sortedVideos.length || isTransitioning) return;
    setIsTransitioning(true);
    const nextIndex = currentIndex - videosPerPage < 0 ? Math.max(0, sortedVideos.length - videosPerPage) : currentIndex - videosPerPage;
    setCurrentIndex(nextIndex);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (!isMobile && isAutoPlaying && sortedVideos.length > videosPerPage) {
      intervalId = setInterval(handleNext, AUTO_SLIDE_INTERVAL);
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

  if (sortedVideos.length === 0) {
    return null;
  }

  const displayVideos = sortedVideos.slice(currentIndex, currentIndex + videosPerPage);
  while (displayVideos.length < videosPerPage) {
    displayVideos.push(sortedVideos[displayVideos.length % sortedVideos.length]);
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto mb-2 md:mb-8">
      <div className="bg-gradient-to-r from-[#f8f8f8] via-[#ffffff] to-[#f8f8f8] rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="px-3 md:px-6 pt-4 md:pt-6 pb-6 md:pb-8">
          <div className="flex items-center gap-2 mb-3 md:mb-6">
            <div className="bg-[#333333] p-1.5 md:p-2 rounded-full">
              <Sparkle className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            </div>
            <h2 className="text-sm md:text-xl font-bold text-[#333333]">
              Popular content
            </h2>
          </div>

          <div className="relative">
            <AnimatePresence initial={false} mode="wait">
              <MostViewedVideosList 
                displayVideos={displayVideos}
                isMobile={isMobile}
                isTransitioning={isTransitioning}
              />
            </AnimatePresence>

            {!isMobile && (
              <>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/3 md:-translate-x-1/4 z-10">
                  <CustomPaginationArrow 
                    direction="left"
                    disabled={isTransitioning}
                    onClick={() => handleManualNavigation(handlePrevious)}
                    className="scale-75 md:scale-100"
                  />
                </div>

                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 md:translate-x-1/4 z-10">
                  <CustomPaginationArrow 
                    direction="right"
                    disabled={isTransitioning}
                    onClick={() => handleManualNavigation(handleNext)}
                    className="scale-75 md:scale-100"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
