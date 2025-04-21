
import { motion } from "framer-motion";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoGridItem } from "@/hooks/video/useVideoGridData";

interface AnimatedVideoProps {
  video: VideoGridItem;
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
}

function AnimatedVideo({ video, className, delay = 0, width = 400, height = 100, rotate = 0 }: AnimatedVideoProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height: height * 1.5, // Adjusted for video aspect ratio
        }}
        className="relative overflow-hidden rounded-2xl"
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent backdrop-blur-[2px] border-2 border-white/[0.15] rounded-2xl" />
      </motion.div>
    </motion.div>
  );
}

interface AnimatedVideoHeroProps {
  videos: VideoGridItem[];
}

export function AnimatedVideoHero({ videos }: AnimatedVideoHeroProps) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#ea384c]/[0.15] via-transparent to-rose-500/[0.05] blur-3xl" />

      <div className="absolute inset-0 overflow-hidden">
        {videos.slice(0, 5).map((video, index) => {
          const positions = [
            { className: "left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]", width: 600, height: 140, rotate: 12, delay: 0.3 },
            { className: "right-[-5%] md:right-[0%] top-[70%] md:top-[75%]", width: 500, height: 120, rotate: -15, delay: 0.5 },
            { className: "left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]", width: 300, height: 80, rotate: -8, delay: 0.4 },
            { className: "right-[15%] md:right-[20%] top-[10%] md:top-[15%]", width: 200, height: 60, rotate: 20, delay: 0.6 },
            { className: "left-[20%] md:left-[25%] top-[5%] md:top-[10%]", width: 150, height: 40, rotate: -25, delay: 0.7 },
          ][index];

          return (
            <AnimatedVideo
              key={video.id}
              video={video}
              {...positions}
            />
          );
        })}
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 md:mb-12"
          >
            <Circle className="h-2 w-2 fill-[#ea384c]" />
            <span className="text-sm text-white/60 tracking-wide">
              Welcome to YidVid
            </span>
          </motion.div>

          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                Your Gateway to
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ea384c] via-white/90 to-rose-300">
                Jewish Content
              </span>
            </h1>
          </motion.div>

          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <p className="text-base sm:text-lg md:text-xl text-white/40 mb-8 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4">
              Discover videos that inspire, entertain, and connect.
              Explore our curated collection of meaningful content.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
  );
}
