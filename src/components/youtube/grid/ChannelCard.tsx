
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

  const isSample = id?.toString()?.includes('sample') || channel_id?.includes('sample');
  const animationDelay = `${0.05 * (index % 10)}s`;

  return (
    <Link
      to={`/channel/${channel_id}`}
      className={cn(
        "block opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]",
        "relative group rounded-lg overflow-hidden transition-all duration-200",
        "hover:scale-[1.03] hover:shadow-md text-center p-4",
        "bg-gray-100 hover:bg-gray-200 mx-auto w-full border border-gray-200"
      )}
      style={{ animationDelay }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      aria-label={`View channel: ${title}`}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center overflow-hidden mb-4 mx-auto 
                      border-2 border-gray-300 group-hover:border-primary transition-all duration-300
                      group-hover:shadow-lg shadow-gray-200">
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
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
              <img src="/lovable-uploads/efca5adc-d9d2-4c5b-8900-e078f9d49b6a.png" alt="YidVid" className="w-10 h-10" />
            </div>
          )}
        </div>
        
        <h3 className="text-sm md:text-base font-medium text-center mb-1 text-gray-800 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-xs text-gray-500">
          View Channel
        </p>
      </div>
    </Link>
  );
};
