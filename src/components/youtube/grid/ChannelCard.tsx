
import { Link } from "react-router-dom";
import { useHiddenChannels } from "@/hooks/channel/useHiddenChannels";
import { EyeOffIcon } from "lucide-react";
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
  const { hiddenChannels, hideChannel } = useHiddenChannels();
  const [showControls, setShowControls] = useState(false);

  const handleHide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    hideChannel(channel_id);
  };

  // Check if this is a sample channel
  const isSample = id?.toString().includes('sample') || channel_id?.includes('sample');

  // Animation delay based on index
  const animationDelay = `${0.05 * (index % 10)}s`;

  return (
    <Link
      to={`/channel/${channel_id}`}
      className={cn(
        "block opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]",
        "relative group rounded-lg overflow-hidden transition-all duration-200",
        "hover:scale-[1.03] hover:shadow-md text-center p-2",
        "bg-gray-50" // Light gray background even when not hovering
      )}
      style={{ animationDelay }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      aria-label={`View channel: ${title}`}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="w-28 h-28 bg-pink-100 rounded-full flex items-center justify-center overflow-hidden mb-2 mx-auto">
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
              <img src="/lovable-uploads/efca5adc-d9d2-4c5b-8900-e078f9d49b6a.png" alt="YidVid" className="w-20 h-20" />
            </div>
          )}
        </div>
        
        <h3 className="text-sm font-medium text-center">
          {title}
        </h3>

        {/* Hide button - only show for non-sample channels */}
        {!isSample && showControls && (
          <button
            onClick={handleHide}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-opacity opacity-80 hover:opacity-100"
            aria-label="Hide channel"
          >
            <EyeOffIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </Link>
  );
};
