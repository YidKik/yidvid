
import { useRef, useEffect, useState } from 'react';

export const useAboutSectionScroll = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  useEffect(() => {
    let accumulatedScroll = 0;
    const maxScroll = 500; // Increased for more control

    const handleWheel = (e: WheelEvent) => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const isInView = rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;
      
      if (isInView) {
        e.preventDefault();
        e.stopPropagation();
        
        // Lock page scroll completely
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        
        // Handle scroll direction for horizontal sliding
        if (e.deltaY > 0) {
          // Scrolling down - slide about section out to the left, cards in from right
          accumulatedScroll += Math.abs(e.deltaY) * 0.6; // Adjusted for smoother scroll
        } else {
          // Scrolling up - bring about section back from left, cards out to right
          accumulatedScroll -= Math.abs(e.deltaY) * 0.6;
        }
        
        // Clamp the scroll value
        accumulatedScroll = Math.max(0, Math.min(maxScroll, accumulatedScroll));
        
        // Convert to progress (0 to 1)
        const newProgress = accumulatedScroll / maxScroll;
        setScrollProgress(newProgress);
        
        console.log('Scroll progress:', newProgress, 'Accumulated:', accumulatedScroll);
        
        // If scrolled back to beginning, allow normal scrolling
        if (newProgress === 0 && e.deltaY < 0) {
          document.body.style.overflow = 'auto';
          document.documentElement.style.overflow = 'auto';
        }
        
        // If fully scrolled and scrolling down more, continue to next section
        if (newProgress >= 1 && e.deltaY > 0) {
          document.body.style.overflow = 'auto';
          document.documentElement.style.overflow = 'auto';
          // Allow the scroll to continue to next section
          setTimeout(() => {
            window.scrollBy(0, e.deltaY * 0.5);
          }, 50);
        }
      } else {
        // Not in view, allow normal scrolling
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
      }
    };

    // Add event listeners with passive: false to allow preventDefault
    document.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      document.removeEventListener('wheel', handleWheel);
      // Restore normal scrolling on cleanup
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, [scrollProgress]);

  return { sectionRef, scrollProgress };
};
