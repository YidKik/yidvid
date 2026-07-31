
import { useState, useEffect } from "react";

// ENHANCED STANDARDIZED BREAKPOINTS FOR BETTER TABLET DETECTION
const MOBILE_BREAKPOINT = 480;  // Below this is mobile (only phones)
const TABLET_BREAKPOINT = 1024; // Between mobile and this is tablet, above is desktop

/**
 * Enhanced hook that provides device type information based on viewport width
 * Returns an object with boolean flags for each device type
 * IMPROVED tablet detection logic
 */
export function useIsMobile() {
  // Lazily initialise from the real viewport so the first paint already matches
  // the device. Defaulting to desktop caused a visible layout jump on mobile.
  const getSizes = () => {
    if (typeof window === 'undefined') {
      return { isMobile: false, isTablet: false, isDesktop: true };
    }
    const width = window.innerWidth;
    return {
      isMobile: width < MOBILE_BREAKPOINT,
      isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
      isDesktop: width >= TABLET_BREAKPOINT,
    };
  };

  const initial = getSizes();
  const [isMobile, setIsMobile] = useState(initial.isMobile);
  const [isTablet, setIsTablet] = useState(initial.isTablet);
  const [isDesktop, setIsDesktop] = useState(initial.isDesktop);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const newIsMobile = width < MOBILE_BREAKPOINT;
      const newIsTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
      const newIsDesktop = width >= TABLET_BREAKPOINT;
      
      setIsMobile(newIsMobile);
      setIsTablet(newIsTablet);
      setIsDesktop(newIsDesktop);
    };

    // Initial check
    checkScreenSize();

    // Add event listener for resize events with debounce
    let timeoutId: NodeJS.Timeout;
    const debouncedCheckScreenSize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScreenSize, 100);
    };

    window.addEventListener('resize', debouncedCheckScreenSize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedCheckScreenSize);
      clearTimeout(timeoutId);
    };
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
