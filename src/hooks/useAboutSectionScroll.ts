
import { useEffect, useState, RefObject } from 'react';

export const useAboutSectionScroll = (sectionRef: RefObject<HTMLElement>) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrollLocked, setIsScrollLocked] = useState(false);

  useEffect(() => {
    let accumulatedScroll = 0;
    const maxScroll = 500; // Increased scroll distance for fuller slide-out

    const handleWheel = (e: WheelEvent) => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const isInView = rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;
      
      if (isInView) {
        e.preventDefault();
        e.stopPropagation();
        
        // Lock the page scroll completely
        document.body.style.overflow = 'hidden';
        setIsScrollLocked(true);
        
        // Handle scroll direction for sliding
        if (e.deltaY > 0) {
          // Scrolling down - slide about section out to the left
          accumulatedScroll += Math.abs(e.deltaY);
        } else {
          // Scrolling up - bring about section back from the left
          accumulatedScroll -= Math.abs(e.deltaY);
        }
        
        // Clamp the scroll value
        accumulatedScroll = Math.max(0, Math.min(maxScroll, accumulatedScroll));
        
        // Convert to progress (0 to 1)
        const newProgress = accumulatedScroll / maxScroll;
        setScrollProgress(newProgress);
        
        // If scrolled back to beginning, allow normal scrolling
        if (newProgress === 0 && e.deltaY < 0) {
          document.body.style.overflow = 'auto';
          setIsScrollLocked(false);
        }
        
        // If fully scrolled out and scrolling down more, continue to next section
        if (newProgress >= 1 && e.deltaY > 0) {
          document.body.style.overflow = 'auto';
          setIsScrollLocked(false);
          // Allow the scroll to continue to next section
          setTimeout(() => {
            window.scrollBy(0, e.deltaY);
          }, 10);
        }
      } else {
        // Not in view, allow normal scrolling
        document.body.style.overflow = 'auto';
        setIsScrollLocked(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrollLocked && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === ' ' || e.key === 'PageDown' || e.key === 'PageUp')) {
        e.preventDefault();
      }
    };

    // Add event listeners with passive: false to allow preventDefault
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
      // Restore normal scrolling on cleanup
      document.body.style.overflow = 'auto';
    };
  }, [scrollProgress, isScrollLocked, sectionRef]);

  return { scrollProgress, isScrollLocked };
};
