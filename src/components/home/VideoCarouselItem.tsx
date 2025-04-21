
import React, { useState } from "react";
import { VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";
import { VideoGridItem } from "@/components/video/VideoGridItem";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface VideoCarouselItemProps {
  video: VideoItemType;
  onClick: (videoId: string) => void;
}

export const VideoCarouselItem = ({ video, onClick }: VideoCarouselItemProps) => {
  const { isMobile } = useIsMobile();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="flex-none relative group"
      style={{ 
        flex: `0 0 ${isMobile ? "80%" : "400px"}`, 
        aspectRatio: "16/9",
      }}
      whileHover={{ 
        scale: 1.03,
        zIndex: 10,
        transition: { duration: 0.2 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onClick(video.video_id)}
    >
      <div className="w-full h-full overflow-hidden rounded-xl shadow-sm transition-all duration-300 group-hover:shadow-md">
        <div className="relative w-full h-full">
          <VideoGridItem video={video} />
          
          {/* Hover overlay */}
          <motion.div 
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0 }}
          >
            <motion.div 
              className="bg-white/90 text-gray-900 px-4 py-2 rounded-full font-medium"
              initial={{ scale: 0.8 }}
              animate={{ scale: isHovered ? 1 : 0.8 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              Watch Now
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
