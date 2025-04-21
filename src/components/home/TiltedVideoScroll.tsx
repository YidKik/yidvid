
import { cn } from "@/lib/utils";
import { VideoGridItem } from "@/hooks/video/useVideoGridData";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useShuffledVideos } from "@/hooks/video/useShuffledVideos";
import { VideoCard } from "@/components/VideoCard";

interface TiltedVideoScrollProps {
  videos: VideoGridItem[];
  className?: string;
}

export function TiltedVideoScroll({ videos = [], className }: TiltedVideoScrollProps) {
  const navigate = useNavigate();
  const shuffledVideos = useShuffledVideos(videos);

  // Use the original videos array if shuffled videos aren't ready yet
  const displayVideos = shuffledVideos.length > 0 ? shuffledVideos : [...videos, ...videos, ...videos];

  return (
    <div className={cn("flex items-center justify-center py-16 perspective-[1000px]", className)}>
      <div className="relative overflow-hidden w-full [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,black_5rem),linear-gradient(to_left,transparent,black_5rem),linear-gradient(to_bottom,transparent,black_5rem),linear-gradient(to_top,transparent,black_5rem)]">
        <motion.div 
          className="grid gap-5 animate-skew-scroll"
          style={{
            gridTemplateColumns: "repeat(2, minmax(250px, 1fr))",
            height: "800px",
            transformStyle: "preserve-3d",
          }}
        >
          {displayVideos.map((video, index) => (
            <motion.div
              key={`${video.id}-${index}`}
              className="group relative cursor-pointer rounded-xl border border-white/[0.08] bg-gradient-to-b from-background/80 to-muted/80 shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:-translate-y-1 hover:shadow-xl overflow-hidden"
              onClick={() => navigate(`/video/${video.video_id}`)}
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>
              <div className="p-4">
                <h3 className="text-white/90 font-medium line-clamp-2 group-hover:text-white transition-colors">
                  {video.title}
                </h3>
                <p className="text-white/60 text-sm mt-2 group-hover:text-white/80 transition-colors">
                  {video.channelName}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
