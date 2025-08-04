
import { useState, useEffect } from 'react';
import { useContentPreloader } from './useContentPreloader';

export const useWelcomeAnimation = () => {
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null);
  const [isPreloading, setIsPreloading] = useState(false);

  // Start preloading when welcome animation is shown
  const { preloadComplete, isPreloading: contentPreloading } = useContentPreloader(showWelcome === true);

  useEffect(() => {
    // Check if user has seen welcome before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    if (!hasSeenWelcome) {
      // Show welcome after 10 seconds for new users
      const timer = setTimeout(() => {
        setShowWelcome(true);
        setIsPreloading(true);
      }, 10000);

      return () => clearTimeout(timer);
    } else {
      // Don't show for returning users
      setShowWelcome(false);
    }
  }, []);

  const markWelcomeAsShown = () => {
    // Mark as seen in localStorage
    localStorage.setItem('hasSeenWelcome', 'true');
    
    // Don't hide welcome until preloading is complete
    if (preloadComplete || !isPreloading) {
      setShowWelcome(false);
      setIsPreloading(false);
    } else {
      // Wait for preloading to complete
      console.info('Welcome animation: Waiting for content preload to complete...');
      const checkPreload = setInterval(() => {
        if (preloadComplete) {
          clearInterval(checkPreload);
          setShowWelcome(false);
          setIsPreloading(false);
        }
      }, 100);
    }
  };

  const resetWelcome = () => {
    setShowWelcome(true);
    setIsPreloading(true);
  };

  return {
    showWelcome,
    markWelcomeAsShown,
    resetWelcome,
    isPreloading: contentPreloading,
    preloadComplete
  };
};
