
import { Link } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Channel } from "@/hooks/channel/useChannelsGrid";

export interface ChannelCardProps {
  channel: Channel;
  index?: number;
}

export const ChannelCard = ({
  channel,
  index = 0
}: ChannelCardProps) => {
  const { id, channel_id, title, thumbnail_url } = channel;
  const [showControls, setShowControls] = useState(false);

  // Check if this is a sample channel, safely handling undefined properties
  const isSample = id?.toString()?.includes('sample') || channel_id?.includes('sample');

  // Animation delay based on index
  const animationDelay = `${0.05 * (index % 10)}s`;

  return (
    <Link
      to={`/channel/${channel_id}`}
      className={cn(
        "block opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]",
        "relative group rounded-lg overflow-hidden transition-all duration-200",
        "hover:scale-[1.03] hover:shadow-md text-center p-2",
        "bg-gray-50 max-w-[120px] mx-auto" // Made smaller with max-width and centered with mx-auto
      )}
      style={{ animationDelay }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      aria-label={`View channel: ${title}`}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center overflow-hidden mb-2 mx-auto">
          {thumbnail_url ? (
            <img
              src={thumbnail_url}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/lovable-uploads/efca5adc-d9d2-4c5b-8900-e078f9d49b6a.png";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <img src="/lovable-uploads/efca5adc-d9d2-4c5b-8900-e078f9d49b6a.png" alt="YidVid" className="w-16 h-16" />
            </div>
          )}
        </div>
        
        <h3 className="text-xs font-medium text-center truncate max-w-full px-1">
          {title}
        </h3>
        
        {/* Hide button has been removed */}
      </div>
    </Link>
  );
};
