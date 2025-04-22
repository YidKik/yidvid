
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

// 3 videos per row, 3 rows.
export const HeroParallax = ({
  videos,
  title = "Popular Videos",
  description = "Discover the most loved Jewish content from our community.",
}: {
  videos: VideoItemType[];
  title?: string;
  description?: string;
}) => {
  // Require at least 9 videos
  const firstRow = videos.slice(0, 3);
  const secondRow = videos.slice(3, 6);
  const thirdRow = videos.slice(6, 9);

  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  // Tweak transforms for more pronounced parallax and vertical reveal
  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 600]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -600]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [10, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.1, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [10, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-400, 300]),
    springConfig
  );

  return (
    <div
      ref={ref}
      className="h-[120vh] py-10 overflow-visible antialiased relative flex flex-col self-auto [perspective:1200px] [transform-style:preserve-3d] w-full"
      // Moved further down the page visually by HomePage parent
    >
      <Header title={title} description={description} />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className="w-full"
      >
        <motion.div className="flex flex-row justify-center gap-16 mb-12">
          {firstRow.map((video) => (
            <VideoCard
              video={video}
              translate={translateX}
              key={video.id}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row justify-center gap-16 mb-12">
          {secondRow.map((video) => (
            <VideoCard
              video={video}
              translate={translateXReverse}
              key={video.id}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row justify-center gap-16">
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
    <div className="max-w-3xl mx-auto py-3 md:py-10 px-4 w-full left-0 top-0 text-center relative z-10">
      <h1 className="text-2xl md:text-5xl font-bold text-white mb-2">
        {title}
      </h1>
      <p className="max-w-2xl text-base md:text-xl mt-1 text-neutral-200 mx-auto">
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
        scale: 1.06,
      }}
      key={video.id}
      className="group/video h-[23vw] min-h-[230px] w-[33vw] min-w-[330px] max-w-[38vw] relative flex-shrink-0 rounded-2xl shadow-lg overflow-hidden transition-all"
    >
      <Link
        to={`/video/${video.video_id}`}
        className="block"
      >
        <AspectRatio ratio={16 / 9} className="h-full w-full">
          <img
            src={video.thumbnail}
            className="object-cover object-center absolute h-full w-full inset-0 rounded-2xl border-4 border-white/10"
            alt={video.title}
          />
        </AspectRatio>
      </Link>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/video:opacity-80 bg-black pointer-events-none rounded-2xl transition-opacity duration-300"></div>
      <h2 className="absolute bottom-4 left-4 opacity-0 group-hover/video:opacity-100 text-white transition-opacity duration-300 text-lg font-medium line-clamp-2 max-w-[90%]">
        {video.title}
      </h2>
    </motion.div>
  );
};
