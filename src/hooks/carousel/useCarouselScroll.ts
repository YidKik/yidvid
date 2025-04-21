
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
    const scrollStep = speed * 0.0005;
    
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
    
    // Start the scroll animation with a delay to ensure proper initialization
    const timer = setTimeout(() => {
      animationRef.current = requestAnimationFrame(scroll);
    }, 500);
    
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
