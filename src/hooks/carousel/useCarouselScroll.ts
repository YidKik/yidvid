
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
  const animationRef = useRef<number | null>(null);

  // Clear any existing animation when component unmounts or dependencies change
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);

  // Handle the actual scrolling logic
  useEffect(() => {
    if (!emblaApi || itemsLength === 0) return;
    
    // Make sure carousel is properly initialized
    emblaApi.reInit();
    
    // Convert speed to a more manageable value (higher number = faster scrolling)
    // DRAMATICALLY increased from 0.005 to 0.05 for much faster scrolling that's clearly visible
    const scrollStep = speed * 0.05;
    
    const scroll = () => {
      if (!emblaApi || scrolling.current) {
        // If user is interacting or emblaApi is not available, just continue the animation loop
        animationRef.current = requestAnimationFrame(scroll);
        return;
      }
      
      try {
        // Determine scroll direction
        const scrollAmount = direction === "ltr" ? scrollStep : -scrollStep;
        
        // Get current scroll position
        const currentScrollProgress = emblaApi.scrollProgress();
        
        // Apply scroll
        emblaApi.scrollTo(currentScrollProgress + scrollAmount);
        
        // Loop around if we reach the end/beginning
        if (direction === "ltr" && currentScrollProgress >= 0.99) {
          emblaApi.scrollTo(0);
        } else if (direction === "rtl" && currentScrollProgress <= 0.01) {
          emblaApi.scrollTo(1);
        }
      } catch (error) {
        console.error("Scroll error:", error);
      }
      
      // Continue the animation loop
      animationRef.current = requestAnimationFrame(scroll);
    };
    
    // Start the scroll animation with a shorter delay
    const timer = setTimeout(() => {
      console.log(`Starting carousel scroll animation with speed: ${speed}, step: ${scrollStep}`);
      animationRef.current = requestAnimationFrame(scroll);
    }, 100); // Very short delay
    
    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [emblaApi, direction, speed, itemsLength]);

  // Handle user interaction
  useEffect(() => {
    if (!emblaApi) return;
    
    const onPointerDown = () => {
      scrolling.current = true;
      console.log("User interaction detected, pausing auto-scroll");
    };
    
    const onPointerUp = () => {
      scrolling.current = false;
      console.log("User interaction ended, resuming auto-scroll");
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
