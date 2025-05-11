
import { motion } from "framer-motion";
import { ContentToggle } from "@/components/content/ContentToggle";
import { MusicSection } from "@/components/content/MusicSection";
import { VideoContent } from "@/components/content/VideoContent";
import { useVideos } from "@/hooks/video/useVideos";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useCallback } from "react";
import { ScrollToTopButton } from "./ScrollToTopButton";
import { Header } from "@/components/Header";
import { filterUnavailableVideos } from "@/hooks/video/utils/validation";
import { WifiOff } from "lucide-react";

export const VideoPageContent = () => {
  const [isMusic, setIsMusic] = useState(false);
  const [networkOffline, setNetworkOffline] = useState(!navigator.onLine);
  const { 
    data: rawVideos, 
    isLoading, 
    refetch, 
    forceRefetch,
    lastSuccessfulFetch, 
    fetchAttempts, 
    error 
  } = useVideos();
  
  // Filter out unavailable videos with improved performance
  const videos = filterUnavailableVideos(rawVideos || []);
  
  const { isMobile } = useIsMobile();

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

  // Optimize the refetch logic to be more selective and less frequent
  useEffect(() => {
    if (rawVideos && rawVideos.length > 0) {
      const filteredOutCount = rawVideos.length - videos.length;
      // Only trigger refetch if significant filtering AND more than 10 minutes since last fetch
      const significantFiltering = filteredOutCount > 5 || (filteredOutCount / rawVideos.length) > 0.3;
      const shouldRefresh = significantFiltering && forceRefetch && 
                           (!lastSuccessfulFetch || 
                            (new Date().getTime() - lastSuccessfulFetch.getTime() > 10 * 60 * 1000));
      
      if (shouldRefresh) {
        console.log(`Filtered out ${filteredOutCount} unavailable videos, triggering refetch`);
        forceRefetch();
      }
    }
  }, [rawVideos, videos.length, forceRefetch, lastSuccessfulFetch]);

  return (
    <div className="flex-1 videos-page">
      <Header />
      {networkOffline && (
        <div className="bg-amber-50 border-b border-amber-200 p-2">
          <div className="flex items-center justify-center gap-2 text-amber-700 text-sm">
            <WifiOff size={16} />
            <p>You appear to be offline. Some features may be limited.</p>
          </div>
        </div>
      )}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mt-4 mx-auto px-2 md:px-6 max-w-[1400px]"
      >
        <div className="space-y-2 md:space-y-4">
          <motion.div 
            className="space-y-0"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <ContentToggle 
              isMusic={isMusic} 
              onToggle={() => setIsMusic(!isMusic)} 
            />
          </motion.div>

          <motion.div
            key={isMusic ? "music" : "videos"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={isMobile ? 'mt-2' : 'mt-4'}
          >
            {!isMusic ? (
              <VideoContent 
                videos={videos} 
                isLoading={isLoading} 
                error={error}
                refetch={refetch}
                forceRefetch={forceRefetch}
                lastSuccessfulFetch={lastSuccessfulFetch}
                fetchAttempts={fetchAttempts}
                networkOffline={networkOffline}
              />
            ) : (
              <MusicSection />
            )}
          </motion.div>
        </div>
      </motion.main>

      <ScrollToTopButton />
    </div>
  );
};
