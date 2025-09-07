
import { useState, useEffect } from 'react';
import { useContentPreloader } from './useContentPreloader';

export const useWelcomeAnimation = () => {
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null);
  const [isPreloading, setIsPreloading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Start preloading when welcome animation is shown
  const { preloadComplete, isPreloading: contentPreloading, imagesCached, videosReady, channelsReady } = useContentPreloader(showWelcome === true);

  // Calculate loading progress based on preloading state
  useEffect(() => {
    if (showWelcome === true) {
      let progress = 0;
      
      // Initial progress
      if (videosReady) progress += 30;
      if (channelsReady) progress += 30;
      if (imagesCached) progress += 30;
      if (preloadComplete) progress = 100;
      
      // Smooth progress animation
      const timer = setTimeout(() => {
        setLoadingProgress(progress);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [showWelcome, videosReady, channelsReady, imagesCached, preloadComplete]);

  useEffect(() => {
    // Check if user has seen welcome before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    if (!hasSeenWelcome) {
      // Show welcome immediately for new users
      setShowWelcome(true);
      setIsPreloading(true);
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
    preloadComplete,
    loadingProgress
  };
};
