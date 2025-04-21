
import React, { useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { VideoGrid } from "@/hooks/video/useVideoGridData";
import useEmblaCarousel from "embla-carousel-react";
import { VideoCard } from "@/components/VideoCard";

interface VideoCarouselProps {
  title: string;
  videos: VideoGrid[];
  direction: "ltr" | "rtl";
  speed: number;
}

export const VideoCarousel = ({ title, videos, direction, speed }: VideoCarouselProps) => {
  const { isMobile } = useIsMobile();
  
  // Set up Embla carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: true,
    containScroll: "trimSnaps",
    direction: direction === "rtl" ? "rtl" : "ltr",
    align: "start",
  });
  
  const scrolling = useRef<boolean>(false);
  
  // Auto-play effect
  useEffect(() => {
    if (!emblaApi || videos.length === 0) return;
    
    emblaApi.reInit();
    
    if (scrolling.current) return;
    
    const autoplay = setInterval(() => {
      if (!scrolling.current) {
        emblaApi.scrollNext();
      }
    }, 50000 / speed); // Adjust speed based on prop
    
    return () => {
      clearInterval(autoplay);
    };
  }, [emblaApi, videos, speed]);
  
  // Handle scroll start/stop
  useEffect(() => {
    if (!emblaApi) return;
    
    const onPointerDown = () => {
      scrolling.current = true;
    };
    
    const onPointerUp = () => {
      scrolling.current = false;
    };
    
    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("pointerUp", onPointerUp);
    
    return () => {
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("pointerUp", onPointerUp);
    };
  }, [emblaApi]);
  
  if (!videos.length) {
    return null;
  }
  
  return (
    <div className="px-2 md:px-4">
      {/* Section title */}
      <h3 className="text-lg font-semibold text-gray-800 mb-3 px-2">
        {title}
      </h3>
      
      {/* Video carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3 md:gap-4">
          {videos.map((video) => (
            <div 
              key={video.id} 
              className={`flex-[0_0_${isMobile ? "75%" : "300px"}] min-w-0`}
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              >
                <VideoCard
                  id={video.id}
                  video_id={video.video_id}
                  title={video.title}
                  thumbnail={video.thumbnail}
                  channelName={video.channelName}
                  channelId={video.channelId}
                  views={video.views}
                  uploadedAt={video.uploadedAt}
                  hideChannelName={isMobile}
                />
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
