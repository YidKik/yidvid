import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '@/contexts/LoadingContext';

export const TopLoadingBar = () => {
  const location = useLocation();
  const { isLoading: contextLoading, progress: contextProgress } = useLoading();
  const [isNavigating, setIsNavigating] = useState(false);
  const [navProgress, setNavProgress] = useState(0);
  const prevPathRef = useRef(location.pathname + location.search);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle route changes - start loading bar immediately on navigation
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    
    if (currentPath !== prevPathRef.current) {
      prevPathRef.current = currentPath;
      setIsNavigating(true);
      setNavProgress(10);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [location.pathname, location.search]);

  // Sync navigation state with context loading
  useEffect(() => {
    if (isNavigating) {
      if (contextLoading) {
        // Context has taken over, use its progress
        setNavProgress(contextProgress);
      } else if (contextProgress === 0 && !contextLoading) {
        // Loading complete
        setNavProgress(100);
        timeoutRef.current = setTimeout(() => {
          setIsNavigating(false);
          setNavProgress(0);
        }, 200);
      }
    }
  }, [contextLoading, contextProgress, isNavigating]);

  // Fallback: if no context loading registers within 500ms, complete anyway
  useEffect(() => {
    if (isNavigating && !contextLoading && navProgress < 100) {
      const fallbackTimeout = setTimeout(() => {
        if (!contextLoading) {
          setNavProgress(100);
          setTimeout(() => {
            setIsNavigating(false);
            setNavProgress(0);
          }, 200);
        }
      }, 500);
      
      return () => clearTimeout(fallbackTimeout);
    }
  }, [isNavigating, contextLoading, navProgress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showBar = isNavigating || contextLoading;
  const displayProgress = contextLoading ? contextProgress : navProgress;

  return (
    <AnimatePresence>
      {showBar && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[9999] h-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="h-full"
            style={{
              background: 'linear-gradient(90deg, hsl(50, 100%, 50%) 0%, hsl(50, 100%, 60%) 50%, hsl(50, 100%, 50%) 100%)',
              boxShadow: '0 0 10px hsl(50, 100%, 50%), 0 0 5px hsl(50, 100%, 50%)',
            }}
            initial={{ width: '0%' }}
            animate={{ width: `${displayProgress}%` }}
            transition={{ 
              duration: 0.15,
              ease: 'easeOut'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
