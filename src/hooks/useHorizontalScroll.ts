
import { useEffect, useState } from 'react';

export const useHorizontalScroll = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 480);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToSection = (sectionIndex: number) => {
    if (isMobile) {
      // For mobile, use vertical scrolling
      const element = document.getElementById(`section-${sectionIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // For desktop, use horizontal scrolling
      setCurrentSection(sectionIndex);
    }
  };

  return {
    isMobile,
    currentSection,
    setCurrentSection,
    scrollToSection
  };
};
