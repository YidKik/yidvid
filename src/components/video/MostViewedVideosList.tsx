
import { motion } from "framer-motion";
import { VideoInfo } from "./types/most-viewed-videos";
import { MostViewedVideoCard } from "./MostViewedVideoCard";
import { useRef, useState, useEffect } from "react";

interface MostViewedVideosListProps {
  displayVideos: VideoInfo[];
  isMobile: boolean;
  isTransitioning: boolean;
}

export const MostViewedVideosList = ({
  displayVideos,
  isMobile,
  isTransitioning
}: MostViewedVideosListProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Setup proper scroll behavior on mobile
  useEffect(() => {
    if (!isMobile || !scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    container.style.overflowX = 'auto';
    container.style.scrollSnapType = 'x mandatory';
    
    // Add scroll snap to children
    Array.from(container.children).forEach((child) => {
      (child as HTMLElement).style.scrollSnapAlign = 'start';
    });
  }, [isMobile, displayVideos]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Snap to closest card after scrolling
    if (scrollContainerRef.current && isMobile) {
      const container = scrollContainerRef.current;
      const itemWidth = container.scrollWidth / displayVideos.length;
      const index = Math.round(container.scrollLeft / itemWidth);
      
      container.scrollTo({
        left: index * itemWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <motion.div 
      ref={scrollContainerRef}
      initial={{ opacity: 0.5, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0.5, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isMobile ? "gap-3" : "grid grid-cols-4 gap-4"}`}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        overflowX: isMobile ? 'auto' : 'hidden',
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      {displayVideos.map(video => (
        <div key={video.id} 
          className={`${isMobile ? "flex-shrink-0 w-[85%] sm:w-[45%]" : "w-full"}`}>
          <MostViewedVideoCard video={video} />
        </div>
      ))}
    </motion.div>
  );
};
