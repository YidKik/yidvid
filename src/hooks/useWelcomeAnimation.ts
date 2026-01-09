
import { useState, useEffect, useRef } from 'react';
import { useContentPreloader } from './useContentPreloader';

export const useWelcomeAnimation = () => {
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null);
  const [isPreloading, setIsPreloading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    // Always show welcome animation on app startup to preload content
    setShowWelcome(true);
    setIsPreloading(true);
    
    // Safety timeout - force complete after 8 seconds max to prevent getting stuck
    timeoutRef.current = setTimeout(() => {
      console.info('Welcome animation: Safety timeout reached, forcing completion');
      setShowWelcome(false);
      setIsPreloading(false);
    }, 8000);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const markWelcomeAsShown = () => {
    // Clear safety timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Mark as seen in localStorage
    localStorage.setItem('hasSeenWelcome', 'true');
    
    // Complete immediately - don't wait for preloading
    setShowWelcome(false);
    setIsPreloading(false);
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
