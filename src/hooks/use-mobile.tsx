
import { useState, useEffect } from "react";

// Standardized breakpoints
const MOBILE_BREAKPOINT = 768;  // Below this is mobile
const TABLET_BREAKPOINT = 1024; // Between mobile and this is tablet, above is desktop

/**
 * Hook that provides device type information based on viewport width
 * Returns an object with boolean flags for each device type
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < MOBILE_BREAKPOINT);
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT);
      setIsDesktop(width >= TABLET_BREAKPOINT);
    };

    // Initial check
    checkScreenSize();

    // Add event listener for resize events
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return { isMobile, isTablet, isDesktop };
}

/**
 * Simple version that returns just a boolean for mobile detection
 * Used where only mobile check is needed
 */
export function useMobileBoolean(): boolean {
  const { isMobile } = useIsMobile();
  return isMobile;
}
