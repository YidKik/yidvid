
import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export const useHorizontalHomeScroll = () => {
  const { isMobile } = useIsMobile();
  const [currentSection, setCurrentSection] = useState(0);

  // Add horizontal scrolling class to body on mount for desktop only
  useEffect(() => {
    if (!isMobile) {
      document.documentElement.classList.add('home-page');
      document.body.classList.add('home-page');
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.documentElement.classList.remove('home-page');
      document.body.classList.remove('home-page');
      document.body.style.overflow = 'auto';
    };
  }, [isMobile]);

  // Handle scroll events with mandatory section 2 locking - desktop only
  useEffect(() => {
    if (isMobile) return;

    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();
      
      // Prevent any scrolling while transitioning
      if (isScrolling) return;
      
      const delta = e.deltaY;
      
      // Detect deliberate scroll
      if (Math.abs(delta) > 10) {
        isScrolling = true;
        
        // Mandatory section 2 locking logic
        if (delta > 0) {
          // Scrolling down
          if (currentSection === 0) {
            // From section 0, always go to section 1 (mandatory stop)
            setCurrentSection(1);
          } else if (currentSection === 1) {
            // From section 1, can go to section 2
            setCurrentSection(2);
          }
          // If already at section 2, stay there
        } else if (delta < 0) {
          // Scrolling up
          if (currentSection === 2) {
            // From section 2, always go to section 1 (mandatory stop)
            setCurrentSection(1);
          } else if (currentSection === 1) {
            // From section 1, can go to section 0
            setCurrentSection(0);
          }
          // If already at section 0, stay there
        }
        
        // Extended timeout to ensure strict section locking
        scrollTimeout = setTimeout(() => {
          isScrolling = false;
        }, 2500); // 2.5 second lock to prevent any multi-section jumping
      }
    };

    window.addEventListener('wheel', handleScroll, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [currentSection, isMobile]);

  // Handle keyboard navigation (desktop only) with same mandatory section 2 logic
  useEffect(() => {
    if (isMobile) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        // Moving right
        if (currentSection === 0) {
          setCurrentSection(1); // Mandatory stop at section 1
        } else if (currentSection === 1) {
          setCurrentSection(2);
        }
      } else if (e.key === 'ArrowLeft') {
        // Moving left
        if (currentSection === 2) {
          setCurrentSection(1); // Mandatory stop at section 1
        } else if (currentSection === 1) {
          setCurrentSection(0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSection, isMobile]);

  return {
    currentSection,
    setCurrentSection,
    isMobile
  };
};
