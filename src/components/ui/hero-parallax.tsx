
"use client";
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";

export const HeroParallax = ({
  videos,
  title = "Popular Videos",
  description = "Discover the most loved Jewish content from our community.",
}: {
  videos: VideoItemType[];
  title?: string;
  description?: string;
}) => {
  const firstRow = videos.slice(0, 5);
  const secondRow = videos.slice(5, 10);
  const thirdRow = videos.slice(10, 15);
  
  return (
    <div className="h-full w-full overflow-hidden relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
          {firstRow.map((video) => (
            <VideoCard video={video} key={video.id} />
          ))}
        </motion.div>
        <motion.div className="flex flex-row mb-20 space-x-20">
          {secondRow.map((video) => (
            <VideoCard video={video} key={video.id} />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20">
          {thirdRow.map((video) => (
            <VideoCard video={video} key={video.id} />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

const VideoCard = ({
  video,
}: {
  video: VideoItemType;
}) => {
  return (
    <motion.div
      whileHover={{
        y: -20,
      }}
      key={video.id}
      className="group/video h-72 w-[30rem] relative flex-shrink-0"
    >
      <Link
        to={`/video/${video.video_id}`}
        className="block group-hover/video:shadow-2xl"
      >
        <AspectRatio ratio={16/9} className="h-full w-full">
          <img
            src={video.thumbnail}
            className="object-cover object-center absolute h-full w-full inset-0 rounded-lg"
            alt={video.title}
          />
        </AspectRatio>
      </Link>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/video:opacity-80 bg-black pointer-events-none rounded-lg transition-opacity duration-300"></div>
      <h2 className="absolute bottom-4 left-4 opacity-0 group-hover/video:opacity-100 text-white transition-opacity duration-300 text-lg font-medium line-clamp-2 max-w-[90%]">
        {video.title}
      </h2>
    </motion.div>
  );
};
