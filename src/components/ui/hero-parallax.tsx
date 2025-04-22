
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

// 3 videos per row, 4 rows = 12 videos
export const HeroParallax = ({
  videos,
  title = "Popular Videos",
  description = "Discover the most loved Jewish content from our community.",
}: {
  videos: VideoItemType[];
  title?: string;
  description?: string;
}) => {
  // Require at least 12 videos for the 4 rows of 3
  const firstRow = videos.slice(0, 3);
  const secondRow = videos.slice(3, 6);
  const thirdRow = videos.slice(6, 9);
  const fourthRow = videos.slice(9, 12);

  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Flatten initial rotation, soften Y movement, increase perspective
  const springConfig = { stiffness: 280, damping: 32, bounce: 100 };

  // Much gentler transforms
  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 450]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -450]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.22], [6, 0]), // Start flatter (was 10)
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.15], [0.15, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.22], [6, 0]), // Match rotateX change
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.22], [-220, 320]), // Gentler
    springConfig
  );

  return (
    <div
      ref={ref}
      className="h-[140vh] pt-[12vh] pb-10 overflow-visible antialiased relative flex flex-col [perspective:1600px] [transform-style:preserve-3d] w-full"
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
        <motion.div className="flex flex-row justify-center gap-10 md:gap-14 mb-10">
          {firstRow.map((video) => (
            <VideoCard
              video={video}
              translate={translateX}
              key={video.id}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row justify-center gap-10 md:gap-14 mb-10">
          {secondRow.map((video) => (
            <VideoCard
              video={video}
              translate={translateXReverse}
              key={video.id}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row justify-center gap-10 md:gap-14 mb-10">
          {thirdRow.map((video) => (
            <VideoCard
              video={video}
              translate={translateX}
              key={video.id}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row justify-center gap-10 md:gap-14">
          {fourthRow.map((video) => (
            <VideoCard
              video={video}
              translate={translateXReverse}
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
      // Flatter + wider + more screen-filling
      className="group/video h-[16vw] min-h-[170px] w-[32vw] min-w-[290px] max-w-[34vw] relative flex-shrink-0 rounded-[28px] shadow-2xl overflow-hidden transition-all"
    >
      <Link
        to={`/video/${video.video_id}`}
        className="block"
      >
        <AspectRatio ratio={16 / 6.7} className="h-full w-full">
          <img
            src={video.thumbnail}
            className="object-cover object-center absolute h-full w-full inset-0 rounded-[28px] border-4 border-white/10"
            alt={video.title}
          />
        </AspectRatio>
      </Link>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/video:opacity-80 bg-black pointer-events-none rounded-[28px] transition-opacity duration-300"></div>
      <h2 className="absolute bottom-3 left-4 opacity-0 group-hover/video:opacity-100 text-white transition-opacity duration-300 text-lg font-medium line-clamp-2 max-w-[90%] drop-shadow-lg">
        {video.title}
      </h2>
    </motion.div>
  );
};
