
import { useMemo, useCallback, useEffect, useState, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useVideoDate } from "@/components/video/useVideoDate";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TrendingSectionProps {
  videos: VideoData[];
}

export const TrendingSection = ({ videos }: TrendingSectionProps) => {
  const { getFormattedDate } = useVideoDate();
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  
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

  // Sort by views to get trending videos
  const allTrendingVideos = useMemo(() => {
    return [...videos]
      .sort((a, b) => (b.views || 0) - (a.views || 0));
  }, [videos]);

  // First row for carousel (15 videos)
  const carouselVideos = useMemo(() => allTrendingVideos.slice(0, 15), [allTrendingVideos]);
  
  // Videos per page in expanded view (3 rows x 4 = 12 videos per page)
  const videosPerPage = 12;
  const totalPages = Math.ceil(allTrendingVideos.length / videosPerPage);
  
  // Current page videos
  const expandedVideos = useMemo(() => {
    const start = currentPage * videosPerPage;
    return allTrendingVideos.slice(start, start + videosPerPage);
  }, [allTrendingVideos, currentPage]);

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
        <Link
          to={`/video/${video.video_id || video.id}`}
          className="block group"
        >
          {/* Thumbnail - rounded with yellow outline on hover */}
          <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-transparent group-hover:border-yellow-400 transition-all duration-300">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          
          {/* Video Info - clean layout like reference */}
          <div className="mt-3">
            {/* Title - bolder, friendly */}
            <h3 className="text-sm font-semibold font-friendly text-foreground line-clamp-2 leading-snug">
              {video.title}
            </h3>
            {/* Channel with actual profile picture */}
            <div className="flex items-center gap-2 mt-2">
              <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-muted">
                {video.channelThumbnail ? (
                  <img
                    src={video.channelThumbnail}
                    alt={video.channel_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {video.channel_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {video.channel_name}
              </p>
            </div>
            {/* Meta - cleaner */}
            <p className="text-xs text-muted-foreground/80 mt-1.5">
              {video.views?.toLocaleString() || 0} views • {getFormattedDate(video.uploaded_at)}
            </p>
          </div>
        </Link>
      </motion.div>
    );
  };

  return (
    <section 
      ref={sectionRef}
      className={`mb-8 py-8 -mx-6 px-6 bg-gradient-to-r from-rose-50/60 via-pink-50/40 to-rose-50/60 dark:from-rose-900/10 dark:via-pink-900/5 dark:to-rose-900/10 ${showAllVideos ? 'min-h-screen pb-20' : 'rounded-3xl'}`}
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
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-full transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <h2 className="text-lg font-semibold text-foreground font-friendly">
                  Trending Videos
                </h2>
              </div>
              <span className="text-sm text-muted-foreground">
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
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  currentPage === 0
                    ? 'bg-muted/30 text-muted-foreground/30 cursor-not-allowed'
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
              
              <span className="text-sm text-muted-foreground px-4">
                {currentPage + 1} / {totalPages}
              </span>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  currentPage >= totalPages - 1
                    ? 'bg-muted/30 text-muted-foreground/30 cursor-not-allowed'
                    : 'bg-muted hover:bg-muted/80 text-foreground'
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
            {/* Header - YouTube style, smaller */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Trending Videos
              </h2>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleViewAllClick}
                  className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  View all
                </button>
                
                <div className="flex gap-1.5">
                  <button
                    onClick={scrollPrev}
                    disabled={!canScrollPrev}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                      canScrollPrev 
                        ? 'bg-muted hover:bg-muted/80 text-foreground' 
                        : 'bg-muted/30 text-muted-foreground/30 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={scrollNext}
                    disabled={!canScrollNext}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                      canScrollNext 
                        ? 'bg-muted hover:bg-muted/80 text-foreground' 
                        : 'bg-muted/30 text-muted-foreground/30 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
