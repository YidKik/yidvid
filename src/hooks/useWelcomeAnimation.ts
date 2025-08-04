
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
    
    console.log('Welcome Animation Hook - hasSeenWelcome:', hasSeenWelcome);
    
    if (!hasSeenWelcome) {
      // Show welcome immediately for new users (no delay)
      console.log('Welcome Animation Hook - Setting showWelcome to true for new user');
      setShowWelcome(true);
      setIsPreloading(true);
    } else {
      // Don't show for returning users, but immediately redirect
      console.log('Welcome Animation Hook - User has seen welcome, redirecting to videos');
      setShowWelcome(false);
      // Redirect returning users to videos page immediately
      window.location.replace('/videos');
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
    // Clear localStorage and reset welcome for testing
    localStorage.removeItem('hasSeenWelcome');
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
