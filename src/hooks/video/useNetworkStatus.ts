
import { useState, useEffect } from "react";

export const useNetworkStatus = () => {
  const [networkOffline, setNetworkOffline] = useState(!navigator.onLine);
  
  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setNetworkOffline(false);
    const handleOffline = () => setNetworkOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return { networkOffline };
};
