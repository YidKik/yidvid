
import React from "react";
import { VideoGridItem as VideoGridItemType } from "@/hooks/video/useVideoGridData";
import { VideoCarousel } from "./VideoCarousel";
import { motion } from "framer-motion";

interface VideoCarouselsProps {
  videos: VideoGridItemType[];
  isLoading: boolean;
  onVideoClick?: (videoId: string) => void;
}

function getSortedVideos(videos: VideoGridItemType[]): VideoGridItemType[] {
  return [...videos].sort((a, b) => {
    const dateA = new Date(a.uploadedAt).getTime();
    const dateB = new Date(b.uploadedAt).getTime();
    return dateB - dateA;
  });
}

export const VideoCarousels = ({ videos, isLoading, onVideoClick }: VideoCarouselsProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6 py-4">
        {[1, 2, 3].map((index) => (
          <div key={index} className="px-6 md:px-16">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-3"></div>
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div 
                  key={idx} 
                  className="flex-none w-64 md:w-80 aspect-video bg-gray-200 rounded animate-pulse"
                  style={{animationDelay: `${idx * 0.1}s`}}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const sortedVideos = getSortedVideos(videos);
  if (!sortedVideos.length) return null;

  // Use different shuffle keys for each row
  const rowShuffleKeys = [1, 2, 3];
  
  // Add category labels for each row
  const rowLabels = ["Popular Videos", "Latest Uploads", "Featured Content"];

  // DRAMATICALLY increased speeds for much faster scrolling that's clearly visible
  const rowSpeeds = [40, 30, 35];

  return (
    <div className="space-y-6">
      {[0, 1, 2].map((index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
          className="overflow-hidden"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2 px-6 md:px-16">
            {rowLabels[index]}
          </h3>
          <VideoCarousel 
            videos={sortedVideos} 
            direction={index % 2 === 0 ? "ltr" : "rtl"} 
            speed={rowSpeeds[index]} 
            shuffleKey={rowShuffleKeys[index]} 
            onVideoClick={onVideoClick}
          />
        </motion.div>
      ))}
    </div>
  );
};
