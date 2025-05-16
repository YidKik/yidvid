
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePrefetchData } from '@/hooks/usePrefetchData';

/**
 * This component preloads the Videos page code when the user is on the home page
 */
export const PagePreloader = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/" || location.pathname === "/home";
  
  // Call usePrefetchData regardless of route, but only perform prefetching when on homepage
  const prefetchData = usePrefetchData();
  
  useEffect(() => {
    if (isHomePage) {
      // Preload the Videos page component
      const preloadVideosPage = async () => {
        try {
          console.log("Preloading Videos page component...");
          
          // This import() call will trigger webpack to load the Videos page chunk
          // even though we're not rendering it yet
          await import('../pages/Videos');
          
          console.log("Videos page component preloaded successfully");
        } catch (err) {
          console.error("Failed to preload Videos page:", err);
        }
      };
      
      // Start preloading sooner to prioritize loading
      preloadVideosPage();
    }
  }, [isHomePage]);
  
  // This component doesn't render anything visible
  return null;
};
