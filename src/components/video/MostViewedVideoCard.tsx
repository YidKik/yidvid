
import { motion } from "framer-motion";
import { VideoCard } from "../VideoCard";
import { VideoInfo } from "./types/most-viewed-videos";

interface MostViewedVideoCardProps {
  video: VideoInfo;
}

export const MostViewedVideoCard = ({ video }: MostViewedVideoCardProps) => {
  return (
    <motion.div 
      key={video.id} 
      className="w-full"
      whileHover={{ 
        scale: 1.03,
        transition: { duration: 0.2 }
      }}
    >
      <VideoCard {...video} hideInfo={true} />
    </motion.div>
  );
};
