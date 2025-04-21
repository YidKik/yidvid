
import React, { useRef, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import useEmblaCarousel from "embla-carousel-react";
import { VideoGridItem as VideoGridItemType } from "@/hooks/video/useVideoGridData";
import { VideoGridItem } from "@/components/video/VideoGridItem";
import { useNavigate } from "react-router-dom";

interface VideoCarouselProps {
  videos: VideoGridItemType[];
  direction: "ltr" | "rtl";
  speed: number;
  shuffleKey?: number;
}

export const VideoCarousel = ({ videos, direction, speed, shuffleKey }: VideoCarouselProps) => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  
  // Shuffle videos once on mount and when shuffleKey changes
  const [shuffledVideos, setShuffledVideos] = useState<VideoGridItemType[]>([]);
  
  useEffect(() => {
    // Shuffle utility
    function shuffle<T>(array: T[]): T[] {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    }
    
    if (videos.length > 0) {
      setShuffledVideos(shuffle(videos));
    }
  }, [videos, shuffleKey]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: true,
    containScroll: "trimSnaps",
    direction: direction === "rtl" ? "rtl" : "ltr",
    align: "start",
  });

  const scrolling = useRef<boolean>(false);
  const animationRef = useRef<number>();

  // Handle continuous auto-scroll animation
  useEffect(() => {
    if (!emblaApi || shuffledVideos.length === 0) return;
    
    // Re-initialize the carousel when videos change
    emblaApi.reInit();
    
    const scrollStep = speed * 0.02; // Control speed (pixels per frame)
    let lastTime = 0;
    
    const scroll = (timestamp: number) => {
      if (!emblaApi) return;
      
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      
      if (!scrolling.current) {
        // Calculate the scroll amount based on direction and speed
        const scrollAmount = (direction === "rtl" ? -1 : 1) * scrollStep * (deltaTime / 16);
        
        // Use scrollSnaps and selectedScrollSnap for proper scrolling
        const scrollSnaps = emblaApi.scrollSnapList();
        const currentIndex = emblaApi.selectedScrollSnap();
        const nextIndex = (currentIndex + 1) % scrollSnaps.length;
        const prevIndex = currentIndex === 0 ? scrollSnaps.length - 1 : currentIndex - 1;
        
        // Determine target based on direction
        const targetIndex = direction === "ltr" ? nextIndex : prevIndex;
        const currentPosition = emblaApi.scrollProgress();
        
        // Create smooth scrolling effect
        if (direction === "ltr") {
          emblaApi.scrollTo(currentPosition + scrollAmount);
          // If we reach the end of current slide, snap to next
          if (currentPosition >= 0.98) emblaApi.scrollTo(nextIndex);
        } else {
          emblaApi.scrollTo(currentPosition - scrollAmount);
          // If we reach the beginning of current slide, snap to previous
          if (currentPosition <= 0.02) emblaApi.scrollTo(prevIndex);
        }
      }
      
      animationRef.current = requestAnimationFrame(scroll);
    };
    
    animationRef.current = requestAnimationFrame(scroll);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [emblaApi, direction, speed, shuffledVideos]);

  // Handle user interaction to pause auto-scroll
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

  // Handle video click to navigate to video details
  const handleVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
  };

  if (!shuffledVideos || shuffledVideos.length === 0) {
    return null;
  }

  return (
    <div className="px-2 md:px-4">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3 md:gap-4">
          {shuffledVideos.map((video) => (
            <div
              key={video.id}
              className="flex-none"
              style={{ 
                flex: `0 0 ${isMobile ? "70%" : "320px"}`, 
                aspectRatio: "16/9",
                cursor: "pointer" 
              }}
              onClick={() => handleVideoClick(video.video_id)}
            >
              <VideoGridItem video={video} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
