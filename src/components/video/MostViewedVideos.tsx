
import { useState, useEffect } from "react";
import { VideoCard } from "../VideoCard";
import { ChevronLeft, ChevronRight, TrendingUp, Eye } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

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
  const isMobile = useIsMobile();
  const videosPerPage = isMobile ? 2 : 4;
  const AUTO_SLIDE_INTERVAL = 8000;
  
  // Ensure we have videos to display
  const ensureVideosToDisplay = () => {
    if (videos && videos.length > 0) {
      return videos;
    }
    
    // Create sample videos as fallback
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
  
  // Sort videos by views in descending order and take only top 10
  const sortedVideos = [...ensureVideosToDisplay()]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10);

  const handleNext = () => {
    if (!sortedVideos.length || isTransitioning) return;
    
    setIsTransitioning(true);
    const nextIndex = currentIndex + videosPerPage >= sortedVideos.length ? 0 : currentIndex + videosPerPage;
    setCurrentIndex(nextIndex);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  const handlePrevious = () => {
    if (!sortedVideos.length || isTransitioning) return;
    
    setIsTransitioning(true);
    const nextIndex = currentIndex - videosPerPage < 0 ? Math.max(0, sortedVideos.length - videosPerPage) : currentIndex - videosPerPage;
    setCurrentIndex(nextIndex);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

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

  // Always show most viewed section even if we have no data (will show fallback)
  if (sortedVideos.length === 0) {
    return null;
  }

  const displayVideos = sortedVideos.slice(currentIndex, currentIndex + videosPerPage);

  return (
    <div className="w-full max-w-[1200px] mx-auto mb-2 md:mb-8">
      <div className="bg-gradient-to-r from-[#111111] via-[#e5e5e5] to-[#111111] rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="px-3 md:px-6 pt-4 md:pt-6 pb-6 md:pb-8">
          <div className="flex items-center gap-2 mb-3 md:mb-6">
            <div className="bg-[#333333] p-1.5 md:p-2 rounded-full">
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-white" />
            </div>
            <h2 className="text-sm md:text-xl font-bold text-[#333333] flex items-center">
              Most Watched
              <span className="hidden md:inline-flex items-center ml-2 text-sm font-normal text-gray-500">
                <Eye className="h-3.5 w-3.5 mr-1 text-gray-400" />
                Popular content
              </span>
            </h2>
          </div>

          <div className="relative">
            <AnimatePresence initial={false} mode="wait">
              <motion.div 
                key={`carousel-${currentIndex}`}
                initial={{ opacity: 0.5, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0.5, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`${isMobile ? "grid grid-cols-2 gap-3" : "grid grid-cols-4 gap-4"}`}
              >
                {displayVideos.map(video => (
                  <motion.div 
                    key={video.id} 
                    className="w-full"
                    whileHover={{ 
                      scale: 1.03,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <VideoCard {...video} hideInfo={true} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {currentIndex > 0 && (
              <button 
                onClick={() => handleManualNavigation(handlePrevious)}
                disabled={isTransitioning}
                className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/3 md:-translate-x-1/4 z-10 p-1.5 md:p-2.5 bg-white/90 hover:bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-90 hover:opacity-100'}`}
                aria-label="Previous videos"
              >
                <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
              </button>
            )}

            {currentIndex + videosPerPage < sortedVideos.length && (
              <button 
                onClick={() => handleManualNavigation(handleNext)}
                disabled={isTransitioning}
                className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 md:translate-x-1/4 z-10 p-1.5 md:p-2.5 bg-white/90 hover:bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-90 hover:opacity-100'}`}
                aria-label="Next videos"
              >
                <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
