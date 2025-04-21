
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
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (!emblaApi || itemsLength === 0) return;
    
    // Re-initialize the carousel when items change
    emblaApi.reInit();
    
    // Adjust speed for more noticeable scrolling
    const scrollStep = speed * 0.08; 
    let lastTime = 0;
    
    const scroll = (timestamp: number) => {
      if (!emblaApi) return;
      
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      
      if (!scrolling.current) {
        // Create continuous scrolling with direction control
        const scrollAmount = (direction === "ltr" ? 1 : -1) * scrollStep * (deltaTime / 16);
        
        try {
          const currentScrollProgress = emblaApi.scrollProgress();
          
          // Adjust for direction
          if (direction === "ltr") {
            emblaApi.scrollTo(currentScrollProgress + (scrollStep * (deltaTime / 16)));
            
            // If we've scrolled almost to the end, loop around
            if (currentScrollProgress > 0.95) {
              emblaApi.scrollTo(0);
            }
          } else {
            emblaApi.scrollTo(currentScrollProgress - (scrollStep * (deltaTime / 16)));
            
            // If we've scrolled almost to the beginning, loop around
            if (currentScrollProgress < 0.05) {
              emblaApi.scrollTo(1);
            }
          }
        } catch (error) {
          console.error("Scroll error:", error);
          // If there's an error, we'll try to recover by continuing animation
        }
      }
      
      animationRef.current = requestAnimationFrame(scroll);
    };
    
    // Start with a slight delay to ensure proper initialization
    setTimeout(() => {
      animationRef.current = requestAnimationFrame(scroll);
      isInitialRender.current = false;
    }, 100);
    
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
