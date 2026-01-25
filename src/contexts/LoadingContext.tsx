import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  progress: number;
  startLoading: () => void;
  setProgress: (progress: number) => void;
  completeLoading: () => void;
  registerLoader: (id: string) => void;
  unregisterLoader: (id: string) => void;
  setLoaderComplete: (id: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgressState] = useState(0);
  const loadersRef = useRef<Map<string, boolean>>(new Map());
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Register a loader (e.g., "videos", "channels", "auth")
  const registerLoader = useCallback((id: string) => {
    loadersRef.current.set(id, false);
    setIsLoading(true);
    
    // Clear any pending completion
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }
  }, []);
  
  // Unregister a loader
  const unregisterLoader = useCallback((id: string) => {
    loadersRef.current.delete(id);
    checkAllComplete();
  }, []);
  
  // Mark a specific loader as complete
  const setLoaderComplete = useCallback((id: string) => {
    loadersRef.current.set(id, true);
    checkAllComplete();
  }, []);
  
  // Check if all registered loaders are complete
  const checkAllComplete = useCallback(() => {
    const loaders = Array.from(loadersRef.current.values());
    
    if (loaders.length === 0) {
      // No loaders registered, complete immediately
      setProgressState(100);
      completionTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        setProgressState(0);
      }, 200);
      return;
    }
    
    const completedCount = loaders.filter(Boolean).length;
    const totalCount = loaders.length;
    const calculatedProgress = Math.round((completedCount / totalCount) * 100);
    
    // Progress moves from 10 to 90 based on actual loading, then jumps to 100 when all done
    const displayProgress = completedCount === totalCount 
      ? 100 
      : Math.min(90, 10 + (calculatedProgress * 0.8));
    
    setProgressState(displayProgress);
    
    if (completedCount === totalCount) {
      // All loaders complete
      completionTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        setProgressState(0);
        loadersRef.current.clear();
      }, 200);
    }
  }, []);
  
  const startLoading = useCallback(() => {
    setIsLoading(true);
    setProgressState(10);
  }, []);
  
  const setProgress = useCallback((value: number) => {
    setProgressState(Math.min(90, value));
  }, []);
  
  const completeLoading = useCallback(() => {
    setProgressState(100);
    completionTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setProgressState(0);
    }, 200);
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <LoadingContext.Provider value={{
      isLoading,
      progress,
      startLoading,
      setProgress,
      completeLoading,
      registerLoader,
      unregisterLoader,
      setLoaderComplete,
    }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Hook for components to register their loading state
export const usePageLoader = (loaderId: string, isLoading: boolean) => {
  const { registerLoader, unregisterLoader, setLoaderComplete } = useLoading();
  const hasRegistered = useRef(false);
  
  useEffect(() => {
    if (!hasRegistered.current) {
      registerLoader(loaderId);
      hasRegistered.current = true;
    }
    
    if (!isLoading && hasRegistered.current) {
      setLoaderComplete(loaderId);
    }
    
    return () => {
      if (hasRegistered.current) {
        unregisterLoader(loaderId);
        hasRegistered.current = false;
      }
    };
  }, [loaderId, isLoading, registerLoader, unregisterLoader, setLoaderComplete]);
};
