
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { VideoGridItem as VideoGridItemType } from "@/hooks/video/useVideoGridData";
import { VideoCarousel } from "./VideoCarousel";

interface VideoCarouselsProps {
  videos: VideoGridItemType[];
  isLoading: boolean;
}

function getSortedVideos(videos: VideoGridItemType[]): VideoGridItemType[] {
  return [...videos].sort((a, b) => {
    const dateA = new Date(a.uploadedAt).getTime();
    const dateB = new Date(b.uploadedAt).getTime();
    return dateB - dateA;
  });
}

// Each row should get a unique shuffle key so that their orders differ
export const VideoCarousels = ({ videos, isLoading }: VideoCarouselsProps) => {
  const { isMobile } = useIsMobile();

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

  const sortedVideos = getSortedVideos(videos);
  if (!sortedVideos.length) return null;

  // Use different shuffle keys for each row so that order differs
  const rowShuffleKeys = [1, 2, 3];

  return (
    <motion.div
      className={`${isMobile ? "w-full py-8" : "w-1/2"} flex flex-col justify-center gap-8 relative`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.4 }}
    >
      {/* All 3 rows get the full sorted videos list, but shuffles differ (via shuffleKey prop) */}
      <VideoCarousel videos={sortedVideos} direction="ltr" speed={32} shuffleKey={rowShuffleKeys[0]} />
      <VideoCarousel videos={sortedVideos} direction="rtl" speed={32} shuffleKey={rowShuffleKeys[1]} />
      <VideoCarousel videos={sortedVideos} direction="ltr" speed={34} shuffleKey={rowShuffleKeys[2]} />
    </motion.div>
  );
};
