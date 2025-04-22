
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

// 4 videos per row, 3 rows = 12 videos
export const HeroParallax = ({
  videos,
  title = "Popular Videos",
  description = "Discover the most loved Jewish content from our community.",
}: {
  videos: VideoItemType[];
  title?: string;
  description?: string;
}) => {
  // 4 videos per row for 3 rows
  const firstRow = videos.slice(0, 4);
  const secondRow = videos.slice(4, 8);
  const thirdRow = videos.slice(8, 12);

  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Strong parallax for "folded/unfolded" look, pronounced slide-down effect:
  const springConfig = { stiffness: 280, damping: 32, bounce: 100 };

  // Dramatic unfold: More aggressive rotateX and translateY for reveal "downward"
  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 480]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -480]),
    springConfig
  );
  // Strong folded: Lay the videos "flatter" at the top, then open up straight
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.22], [32, 0]), // Much more pronounced at top
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.22], [18, 0]),
    springConfig
  );
  // Slide the entire block much further down
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.22], [-540, 240]), // Notice higher negative at the start, bigger down opening
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.13], [0.11, 1]),
    springConfig
  );

  return (
    <div
      ref={ref}
      className="h-[150vh] pt-[25vh] pb-10 overflow-visible antialiased relative flex flex-col [perspective:2000px] [transform-style:preserve-3d] w-full"
      // ↑ More top padding and height for lower placement
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
        <motion.div className="flex flex-row justify-center gap-6 md:gap-10 mb-8">
          {firstRow.map((video) => (
            <VideoCard
              video={video}
              translate={translateX}
              key={video.id}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row justify-center gap-6 md:gap-10 mb-8">
          {secondRow.map((video) => (
            <VideoCard
              video={video}
              translate={translateXReverse}
              key={video.id}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row justify-center gap-6 md:gap-10">
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
  if (!title && !description) return null;
  return (
    <div className="max-w-3xl mx-auto py-3 md:py-8 px-4 w-full left-0 top-0 text-center relative z-10">
      {title && (
        <h1 className="text-2xl md:text-5xl font-bold text-white mb-2">
          {title}
        </h1>
      )}
      {description && (
        <p className="max-w-2xl text-base md:text-xl mt-1 text-neutral-200 mx-auto">
          {description}
        </p>
      )}
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
        y: -22,
        scale: 1.045,
      }}
      key={video.id}
      className="group/video h-[18vw] min-h-[170px] w-[24vw] min-w-[220px] max-w-[26vw] relative flex-shrink-0 rounded-lg shadow-2xl overflow-hidden transition-all"
      // ↑ less rounded, taller, boxier card
    >
      <Link
        to={`/video/${video.video_id}`}
        className="block"
      >
        <AspectRatio ratio={16 / 7} className="h-full w-full">
          <img
            src={video.thumbnail}
            className="object-cover object-center absolute h-full w-full inset-0 rounded-lg border-4 border-white/10"
            alt={video.title}
          />
        </AspectRatio>
      </Link>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/video:opacity-80 bg-black pointer-events-none rounded-lg transition-opacity duration-300"></div>
      <h2 className="absolute bottom-3 left-4 opacity-0 group-hover/video:opacity-100 text-white transition-opacity duration-300 text-lg font-medium line-clamp-2 max-w-[90%] drop-shadow-lg">
        {video.title}
      </h2>
    </motion.div>
  );
};
