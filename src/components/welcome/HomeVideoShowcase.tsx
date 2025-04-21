
import { useEffect, useState, useRef } from "react";
import { VideoGridItem } from "@/components/video/VideoGridItem";
import { useVideoGridData, VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";
import { motion } from "framer-motion";

// Helper to split videos into chunks for each row
const chunkVideos = (videos: VideoItemType[], size: number) => {
  const rows: VideoItemType[][] = [];
  for (let i = 0; i < 4; i++) {
    rows.push(videos.slice(i * size, (i + 1) * size));
  }
  return rows;
};

interface RowProps {
  videos: VideoItemType[];
  direction: "up" | "down";
  speed: number;
}

const AnimatedVideoRow = ({ videos, direction, speed }: RowProps) => {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const animationName = direction === "up" ? "scroll-up" : "scroll-down";

  // Keyframes (injected only once)
  useEffect(() => {
    if (!document.getElementById('video-row-anim')) {
      const style = document.createElement('style');
      style.id = 'video-row-anim';
      style.innerHTML = `
        @keyframes scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scroll-down {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Loop videos for continual scroll effect
  const doubledVideos = [...videos, ...videos];

  return (
    <div
      ref={rowRef}
      className="relative w-full h-44 overflow-hidden"
    >
      <div
        className="flex gap-6 absolute left-0 w-full"
        style={{
          top: 0,
          flexDirection: "row",
          animation: `${animationName} ${speed}s linear infinite`,
        }}
      >
        {doubledVideos.map((video, i) => (
          <motion.div
            key={video.id + "-" + i}
            className="w-56 flex-shrink-0"
            style={{
              transform: `rotate(${(Math.random() - 0.5) * 7}deg) scale(0.95)`, // small tilt for effect
            }}
            whileHover={{ 
              scale: 1.05, 
              transition: { duration: 0.2 } 
            }}
          >
            <VideoGridItem video={video} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const HomeVideoShowcase = () => {
  // Grab 20 latest videos for showcase
  const { videos, loading } = useVideoGridData(20);
  const rowSize = 5;

  if (loading || !videos.length) return (
    <div className="w-full flex flex-col items-center py-8">
      <span className="text-2xl font-bold text-purple-400 mb-4 animate-pulse">Loading featured videos...</span>
    </div>
  );

  const rows = chunkVideos(videos, rowSize);

  return (
    <motion.div 
      className="w-full max-w-7xl mx-auto py-10 md:py-14 bg-gradient-to-br from-[#f6dbf5]/40 to-[#ffe29f]/40 rounded-3xl shadow-lg border border-white/30 backdrop-blur-md"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
    >
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-primary via-accent to-pink-400 bg-clip-text text-transparent animate-fade-in drop-shadow-lg">
        Latest Videos
      </h2>
      <div className="flex flex-col gap-7">
        {rows.map((videos, i) => (
          <AnimatedVideoRow
            key={i}
            videos={videos}
            direction={i % 2 === 0 ? "down" : "up"}
            speed={18 - i * 2}
          />
        ))}
      </div>
    </motion.div>
  );
};
