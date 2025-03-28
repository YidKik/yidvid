
import { Link } from "react-router-dom";
import { useHiddenChannels } from "@/hooks/channel/useHiddenChannels";
import { EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ChannelCardProps {
  id: string;
  channel_id: string;
  title: string;
  thumbnail_url: string | null;
  index: number;
}

export const ChannelCard = ({
  id,
  channel_id,
  title,
  thumbnail_url,
  index
}: ChannelCardProps) => {
  const { hiddenChannels, hideChannel } = useHiddenChannels();
  const [showControls, setShowControls] = useState(false);

  const handleHide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    hideChannel(channel_id);
  };

  // Check if this is a sample channel
  const isSample = id.toString().includes('sample') || channel_id.includes('sample');

  // Animation delay based on index
  const animationDelay = `${0.05 * (index % 10)}s`;

  return (
    <Link
      to={`/channel/${channel_id}`}
      className={cn(
        "block opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]",
        "relative group rounded-lg overflow-hidden transition-all duration-200",
        "hover:scale-[1.03] hover:shadow-md"
      )}
      style={{ animationDelay }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      aria-label={`View channel: ${title}`}
    >
      <div className="aspect-video bg-muted/50 flex items-center justify-center overflow-hidden">
        {thumbnail_url ? (
          <img
            src={thumbnail_url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-b from-gray-200 to-gray-300">
            <span className="text-3xl font-bold text-gray-500">{title.charAt(0)}</span>
          </div>
        )}
        
        {/* Overlay with channel title */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2">
          <h3 className="text-white text-sm font-medium truncate w-full">
            {title}
          </h3>
        </div>

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
