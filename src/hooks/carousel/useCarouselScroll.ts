
import { useRef, useEffect } from "react";
import { EmblaCarouselType } from "embla-carousel-react";

interface UseCarouselScrollProps {
  emblaApi: EmblaCarouselType | undefined;
  direction: "ltr" | "rtl";
  speed: number;
  itemsLength: number;
}

export const useCarouselScroll = ({ emblaApi, direction, speed, itemsLength }: UseCarouselScrollProps) => {
  const scrolling = useRef<boolean>(false);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!emblaApi || itemsLength === 0) return;
    
    // Re-initialize the carousel when items change
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
  }, [emblaApi, direction, speed, itemsLength]);

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

  return { scrolling };
};
