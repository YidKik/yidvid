
import React, { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { VideoGridItem } from "@/hooks/video/useVideoGridData";
import { VideoCarousel } from "./VideoCarousel";

interface VideoCarouselsProps {
  videos: VideoGridItem[];
  isLoading: boolean;
}

export const VideoCarousels = ({ videos, isLoading }: VideoCarouselsProps) => {
  const { isMobile } = useIsMobile();
  const [shuffledVideos, setShuffledVideos] = useState<VideoGridItem[]>([]);
  const [newVideos, setNewVideos] = useState<VideoGridItem[]>([]);
  
  console.log("VideoCarousels rendering with", videos.length, "videos, isLoading:", isLoading);
  
  // Prepare different video sets
  useEffect(() => {
    if (videos.length > 0) {
      console.log("Processing videos for carousels");
      
      // Sort by newest first for the "All New Videos" row
      const sortedByDate = [...videos].sort((a, b) => {
        const dateA = new Date(a.uploadedAt).getTime();
        const dateB = new Date(b.uploadedAt).getTime();
        return dateB - dateA;
      });
      
      // Get newest videos
      setNewVideos(sortedByDate.slice(0, 12));
      
      // Create shuffled videos for variety
      const shuffled = [...videos].sort(() => Math.random() - 0.5);
      setShuffledVideos(shuffled);
    }
  }, [videos]);

  if (isLoading) {
    return (
      <div className={`${isMobile ? "w-full py-8" : "w-1/2"} flex items-center justify-center`}>
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-slate-200 h-10 w-10"></div>
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 bg-slate-200 rounded"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                <div className="h-2 bg-slate-200 rounded col-span-1"></div>
              </div>
              <div className="h-2 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`${isMobile ? "w-full py-8" : "w-1/2"} flex flex-col justify-center gap-8 relative`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.4 }}
    >
      {/* First row - All New Videos (left to right) */}
      {newVideos.length > 0 && (
        <VideoCarousel 
          title="All New Videos" 
          videos={newVideos} 
          direction="ltr" 
          speed={30}
        />
      )}
      
      {/* Second row - Featured Videos (right to left) */}
      {shuffledVideos.length > 0 && (
        <VideoCarousel 
          title="Featured Videos" 
          videos={shuffledVideos.slice(0, 15)} 
          direction="rtl" 
          speed={25}
        />
      )}
      
      {/* Third row - Popular Videos (left to right) */}
      {shuffledVideos.length > 0 && (
        <VideoCarousel 
          title="Popular Videos" 
          videos={shuffledVideos.slice(15, 30)} 
          direction="ltr" 
          speed={35}
        />
      )}
    </motion.div>
  );
};
