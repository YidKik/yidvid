
import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { VideoGridItem as VideoGridItemType } from "@/hooks/video/useVideoGridData";
import { useNavigate } from "react-router-dom";
import { useCarouselScroll } from "@/hooks/carousel/useCarouselScroll";
import { useShuffledVideos } from "@/hooks/video/useShuffledVideos";
import { VideoCarouselItem } from "./VideoCarouselItem";
import { motion } from "framer-motion";

interface VideoCarouselProps {
  videos: VideoGridItemType[];
  direction: "ltr" | "rtl";
  speed: number;
  shuffleKey?: number;
  onVideoClick?: (videoId: string) => void;
}

export const VideoCarousel = ({ 
  videos, 
  direction, 
  speed, 
  shuffleKey,
  onVideoClick 
}: VideoCarouselProps) => {
  const navigate = useNavigate();
  const shuffledVideos = useShuffledVideos(videos, shuffleKey);
  
  // Create embla carousel with proper configuration
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: true,
    containScroll: false,
    direction: direction,
    align: "start",
    watchDrag: false, // Disable watch drag to make scrolling smoother
  });

  // Use the improved carousel scroll hook with faster speed
  useCarouselScroll({
    emblaApi,
    direction,
    speed,
    itemsLength: shuffledVideos.length,
  });

  // Add console log to help debug
  React.useEffect(() => {
    console.log(`VideoCarousel initialized with ${shuffledVideos.length} videos and speed ${speed}`);
    
    // Force reinitialization after a short delay to ensure proper scrolling
    if (emblaApi) {
      const timer = setTimeout(() => {
        emblaApi.reInit();
        console.log("Forcing reinitialization of video carousel");
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [emblaApi, shuffledVideos.length, speed]);

  const handleVideoClick = (videoId: string) => {
    if (onVideoClick) {
      onVideoClick(videoId);
    } else {
      navigate(`/video/${videoId}`);
    }
  };

  if (!shuffledVideos || shuffledVideos.length === 0) {
    return null;
  }

  return (
    <motion.div 
      className="px-2 md:px-4 mb-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div 
        className="overflow-hidden rounded-xl" 
        ref={emblaRef}
        style={{ cursor: "grab" }}
      >
        <div className="flex gap-3 md:gap-4">
          {shuffledVideos.map((video, index) => (
            <VideoCarouselItem
              key={`${video.id}-${index}`}
              video={video}
              onClick={handleVideoClick}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
