
import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { VideoGridItem } from "@/hooks/video/useVideoGridData";

interface VideoRowProps {
  videos: VideoGridItem[];
  direction: "leftToRight" | "rightToLeft";
  speed: number;
  loading?: boolean;
}

export const VideoRow: React.FC<VideoRowProps> = ({ 
  videos, 
  direction, 
  speed,
  loading
}) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const duplicatedVideos = [...videos, ...videos]; // Duplicate videos for seamless loop
  
  // Handle video click
  const handleVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
  };
  
  // Return placeholder if loading or no videos
  if (loading || videos.length === 0) {
    return (
      <div className="flex gap-4 overflow-hidden py-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`placeholder-${index}`}
            className="flex-shrink-0 w-64 h-36 bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden py-2" ref={containerRef}>
      <motion.div
        className="flex gap-4"
        animate={{
          x: direction === "leftToRight" 
            ? [0, -videos.length * 272] // 272 = width (256) + gap (16)
            : [-videos.length * 272, 0]
        }}
        transition={{
          repeat: Infinity,
          duration: speed,
          ease: "linear",
          repeatType: "loop"
        }}
      >
        {duplicatedVideos.map((video, index) => (
          <motion.div
            key={`${video.id}-${index}`}
            className="flex-shrink-0 w-64 h-36 rounded-lg overflow-hidden cursor-pointer shadow-md"
            whileHover={{ scale: 1.05, zIndex: 5 }}
            transition={{ duration: 0.2 }}
            onClick={() => handleVideoClick(video.video_id)}
          >
            <img
              src={video.thumbnail || "/placeholder.svg"}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
              <p className="text-white text-sm font-medium truncate">{video.title}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
