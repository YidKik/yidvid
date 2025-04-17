
import { motion } from "framer-motion";
import { VideoInfo } from "./types/most-viewed-videos";
import { MostViewedVideoCard } from "./MostViewedVideoCard";
import { useRef, useState } from "react";

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
  };

  return (
    <motion.div 
      ref={scrollContainerRef}
      initial={{ opacity: 0.5, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0.5, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`grid ${isMobile ? "grid-cols-2 gap-3 touch-pan-x" : "grid-cols-4 gap-4"}`}
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
        <MostViewedVideoCard key={video.id} video={video} />
      ))}
    </motion.div>
  );
};
