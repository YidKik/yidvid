
import { useRef, useEffect } from "react";
import { UseEmblaCarouselType } from "embla-carousel-react";

interface UseCarouselScrollProps {
  emblaApi: UseEmblaCarouselType[1] | undefined;
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
    
    const scrollStep = speed * 0.05; // Increased speed factor for more noticeable movement
    let lastTime = 0;
    
    const scroll = (timestamp: number) => {
      if (!emblaApi) return;
      
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      
      if (!scrolling.current) {
        // Create continuous scrolling by moving content without waiting for snap points
        emblaApi.scrollNext(true); // Fix: Pass boolean instead of object for loop parameter
        
        // Force a small movement each frame to create continuous movement
        const engine = emblaApi.internalEngine();
        if (engine) {
          const currentScrollProgress = emblaApi.scrollProgress();
          emblaApi.scrollTo(currentScrollProgress + (scrollStep * (deltaTime / 16)));
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
  }, [emblaApi, speed, itemsLength]);

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
