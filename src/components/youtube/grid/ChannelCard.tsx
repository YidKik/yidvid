
import { Link } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Channel } from "@/hooks/channel/useChannelsGrid";
import { motion } from "framer-motion";

export interface ChannelCardProps {
  channel: Channel;
  index?: number;
}

export const ChannelCard = ({
  channel,
  index = 0
}: ChannelCardProps) => {
  const { id, channel_id, title, thumbnail_url } = channel;
  const [imageError, setImageError] = useState(false);

  const animationDelay = 0.05 * (index % 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.4, ease: "easeOut" }}
    >
      <Link
        to={`/channel/${channel_id}`}
        className="channel-card-modern block"
        aria-label={`View channel: ${title}`}
      >
        <div className="channel-avatar-modern">
          {thumbnail_url && !imageError ? (
            <img
              src={thumbnail_url}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <img 
                src="/lovable-uploads/efca5adc-d9d2-4c5b-8900-e078f9d49b6a.png" 
                alt="YidVid" 
                className="w-8 h-8 opacity-50" 
              />
            </div>
          )}
        </div>
        
        <h3 className="channel-name-modern line-clamp-2">
          {title}
        </h3>
        
        <p className="channel-cta-modern">
          View Channel →
        </p>
      </Link>
    </motion.div>
  );
};
