import { useMemo, useCallback, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useVideoDate } from "@/components/video/useVideoDate";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VideoCardWithOptions } from "@/components/video/VideoCardWithOptions";

interface NewVideosSectionProps {
  videos: VideoData[];
  autoExpand?: boolean;
}

export const NewVideosSection = ({ videos, autoExpand = false }: NewVideosSectionProps) => {
  const { getFormattedDate } = useVideoDate();
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const navigate = useNavigate();

  // Sync state when autoExpand prop changes (e.g., navigating via sidebar)
  useEffect(() => {
    if (autoExpand) {
      setShowAllVideos(true);
      setHasAnimated(true);
    }
  }, [autoExpand]);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 5,
    containScroll: "keepSnaps",
    dragFree: false,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Handle autoExpand - scroll to section when expanded via URL
  useEffect(() => {
    if (autoExpand && showAllVideos) {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [autoExpand, showAllVideos]);

  // Sort by upload date to get newest videos
  const allNewVideos = useMemo(() => {
    return [...videos]
      .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
  }, [videos]);

  // First row for carousel (5 videos)
  const carouselVideos = useMemo(() => allNewVideos.slice(0, 15), [allNewVideos]);
  
  // Videos per page in expanded view (3 rows x 4 = 12 videos per page)
  const videosPerPage = 12;
  const totalPages = Math.ceil(allNewVideos.length / videosPerPage);
  
  // Current page videos
  const expandedVideos = useMemo(() => {
    const start = currentPage * videosPerPage;
    return allNewVideos.slice(start, start + videosPerPage);
  }, [allNewVideos, currentPage]);

  const handleViewAllClick = () => {
    setShowAllVideos(true);
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => setHasAnimated(true), 800);
    }, 50);
  };

  const handleBackClick = () => {
    setShowAllVideos(false);
    setCurrentPage(0);
    setHasAnimated(false);
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!carouselVideos || carouselVideos.length === 0) return null;

  // Video Card Component
  const VideoCard = ({ video, index, isGrid = false }: { video: VideoData; index: number; isGrid?: boolean }) => {
    const shouldAnimate = isGrid && index >= 4 && !hasAnimated;
    
    return (
      <motion.div
        className={isGrid ? 'w-full' : 'flex-none w-[calc(20%-13px)]'}
        initial={shouldAnimate ? { opacity: 0, y: 20, scale: 0.95 } : { opacity: 1, y: 0, scale: 1 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={shouldAnimate ? { 
          duration: 0.35, 
          delay: (index - 4) * 0.03,
          ease: [0.25, 0.46, 0.45, 0.94]
        } : { duration: 0 }}
      >
        <VideoCardWithOptions
          videoId={video.video_id || video.id}
          videoUuid={video.id}
          title={video.title}
          thumbnail={video.thumbnail}
          channelName={video.channel_name}
          channelThumbnail={video.channelThumbnail}
          views={video.views}
          formattedDate={getFormattedDate(video.uploaded_at)}
          duration={video.duration}
        />
      </motion.div>
    );
  };

  return (
    <section 
      ref={sectionRef}
      className={`mb-8 py-8 -mx-6 px-6 bg-gray-50 dark:bg-gray-900/30 ${showAllVideos ? 'min-h-screen pb-20' : 'rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800'}`}
    >
      <AnimatePresence mode="wait">
        {showAllVideos ? (
          /* Expanded Grid View */
          <motion.div
            key="all-videos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header with Back button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackClick}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <h2 className="text-lg font-semibold text-foreground font-friendly">
                  Latest Videos
                </h2>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {currentPage + 1} of {totalPages}
              </span>
            </div>

            {/* Grid of videos - 4 columns, 3 rows */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {expandedVideos.map((video, index) => (
                <VideoCard 
                  key={video.id} 
                  video={video} 
                  index={index}
                  isGrid={true}
                />
              ))}
            </div>

            {/* Pagination Arrows */}
            <div className="flex justify-center items-center gap-6 mt-10">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                  currentPage === 0
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'bg-yellow-400 text-gray-900 shadow-md hover:shadow-lg hover:scale-105'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                <span className="text-sm font-medium text-foreground">{currentPage + 1}</span>
                <span className="text-gray-400">/</span>
                <span className="text-sm text-gray-500">{totalPages}</span>
              </div>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1}
                className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                  currentPage >= totalPages - 1
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'bg-yellow-400 text-gray-900 shadow-md hover:shadow-lg hover:scale-105'
                }`}
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Normal Carousel View */
          <motion.div
            key="carousel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Latest Videos
              </h2>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleViewAllClick}
                  className="px-4 py-1.5 text-xs font-semibold text-gray-900 bg-yellow-400 hover:bg-yellow-500 rounded-full transition-all duration-200 hover:scale-105 shadow-sm"
                >
                  View all
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={scrollPrev}
                    disabled={!canScrollPrev}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                      canScrollPrev 
                        ? 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:scale-110' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={scrollNext}
                    disabled={!canScrollNext}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                      canScrollNext 
                        ? 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:scale-110' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4">
                {carouselVideos.map((video, index) => (
                  <VideoCard 
                    key={video.id} 
                    video={video} 
                    index={index}
                    isGrid={false}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
