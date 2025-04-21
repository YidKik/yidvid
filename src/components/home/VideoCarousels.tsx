
import React, { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { VideoGridItem as VideoGridItemType } from "@/hooks/video/useVideoGridData";
import { VideoCarousel } from "./VideoCarousel";

interface VideoCarouselsProps {
  videos: VideoGridItemType[];
  isLoading: boolean;
}

export const VideoCarousels = ({ videos, isLoading }: VideoCarouselsProps) => {
  const { isMobile } = useIsMobile();
  const [chunks, setChunks] = useState<VideoGridItemType[][]>([[], [], []]);

  // Remove titles, section headers, and only display video thumbnails, shuffle with no overlap
  useEffect(() => {
    if (videos.length > 0) {
      // Start with videos sorted from newest to oldest
      const sorted = [...videos].sort((a, b) => {
        const dateA = new Date(a.uploadedAt).getTime();
        const dateB = new Date(b.uploadedAt).getTime();
        return dateB - dateA;
      });

      // Shuffle for each row ensuring no overlap (split sorted array into 3 chunks, then shuffle each)
      const chunkSize = Math.ceil(sorted.length / 3);
      const chunk1 = sorted.slice(0, chunkSize);
      const chunk2 = sorted.slice(chunkSize, 2 * chunkSize);
      const chunk3 = sorted.slice(2 * chunkSize);

      // Helper shuffle function
      function shuffle(arr: VideoGridItemType[]) {
        return arr
          .map(value => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value);
      }

      setChunks([
        shuffle(chunk1),
        shuffle(chunk2),
        shuffle(chunk3)
      ]);
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
      {/* First row - LTR */}
      {chunks[0].length > 0 && (
        <VideoCarousel
          videos={chunks[0]}
          direction="ltr"
          speed={30}
        />
      )}
      {/* Second row - RTL */}
      {chunks[1].length > 0 && (
        <VideoCarousel
          videos={chunks[1]}
          direction="rtl"
          speed={25}
        />
      )}
      {/* Third row - LTR */}
      {chunks[2].length > 0 && (
        <VideoCarousel
          videos={chunks[2]}
          direction="ltr"
          speed={35}
        />
      )}
    </motion.div>
  );
};
