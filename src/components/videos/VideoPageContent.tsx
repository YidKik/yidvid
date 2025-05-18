
import { motion } from "framer-motion";
import { ContentToggle } from "@/components/content/ContentToggle";
import { MusicSection } from "@/components/content/MusicSection";
import { VideoContent } from "@/components/content/VideoContent";
import { useVideos } from "@/hooks/video/useVideos";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { ScrollToTopButton } from "./ScrollToTopButton";
import { Header } from "@/components/Header";
import { filterUnavailableVideos } from "@/hooks/video/utils/validation";

export const VideoPageContent = () => {
  const [isMusic, setIsMusic] = useState(false);
  const { 
    data: rawVideos, 
    isLoading, 
    refetch, 
    forceRefetch,
    lastSuccessfulFetch, 
    fetchAttempts, 
    error 
  } = useVideos();
  
  // Filter out unavailable videos
  const videos = filterUnavailableVideos(rawVideos || []);
  
  const { isMobile } = useIsMobile();

  // If many videos were filtered out as unavailable, we should refetch
  useEffect(() => {
    if (rawVideos && rawVideos.length > 0) {
      const filteredOutCount = rawVideos.length - videos.length;
      const significantFiltering = filteredOutCount > 3 || (filteredOutCount / rawVideos.length) > 0.2;
      
      // If we filtered out a significant number of videos, trigger a refetch to get fresh content
      if (significantFiltering && forceRefetch) {
        console.log(`Filtered out ${filteredOutCount} unavailable videos, triggering refetch`);
        forceRefetch();
      }
    }
  }, [rawVideos, videos.length, forceRefetch]);

  return (
    <div className="flex-1 videos-page">
      <Header />
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
                refetch={refetch}
                forceRefetch={forceRefetch}
                lastSuccessfulFetch={lastSuccessfulFetch}
                fetchAttempts={fetchAttempts}
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
