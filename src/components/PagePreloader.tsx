
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * This component preloads the Videos page code when the user is on the home page
 */
export const PagePreloader = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/" || location.pathname === "/home";
  
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
      
      // Delay preloading slightly to prioritize rendering the current page first
      const timer = setTimeout(preloadVideosPage, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isHomePage]);
  
  // This component doesn't render anything visible
  return null;
};
