
"use client";
import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
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
  // Split videos into 3 rows
  const firstRow = videos.slice(0, 5);
  const secondRow = videos.slice(5, 10);
  const thirdRow = videos.slice(10, 15);
  
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
    springConfig
  );
  
  return (
    <div
      ref={ref}
      className="h-[300vh] py-20 overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d] bg-[#030303]"
    >
      <Header title={title} description={description} />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
      >
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
          {firstRow.map((video) => (
            <VideoCard
              video={video}
              translate={translateX}
              key={video.id}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row mb-20 space-x-20">
          {secondRow.map((video) => (
            <VideoCard
              video={video}
              translate={translateXReverse}
              key={video.id}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20">
          {thirdRow.map((video) => (
            <VideoCard
              video={video}
              translate={translateX}
              key={video.id}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export const Header = ({ 
  title, 
  description 
}: { 
  title: string; 
  description: string;
}) => {
  return (
    <div className="max-w-7xl relative mx-auto py-10 md:py-20 px-4 w-full left-0 top-0">
      <h1 className="text-2xl md:text-5xl font-bold text-white">
        {title}
      </h1>
      <p className="max-w-2xl text-base md:text-xl mt-4 text-neutral-200">
        {description}
      </p>
    </div>
  );
};

export const VideoCard = ({
  video,
  translate,
}: {
  video: VideoItemType;
  translate: MotionValue<number>;
}) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
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
