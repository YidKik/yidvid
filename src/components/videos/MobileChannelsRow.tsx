
import { Link } from "react-router-dom";
import { useChannelsGrid } from "@/hooks/channel/useChannelsGrid";
import { ChevronRight, Play } from "lucide-react";

export const MobileChannelsRow = () => {
  const { manuallyFetchedChannels: channels, isLoading } = useChannelsGrid();

  // Limit to first 8 channels for mobile
  const displayChannels = channels?.slice(0, 8) || [];

  if (isLoading || displayChannels.length === 0) return null;

  return (
    <section className="mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "'Quicksand', sans-serif" }}>
          Channels
        </h2>
        <Link 
          to="/channels"
          className="text-xs font-medium text-primary flex items-center gap-0.5"
        >
          See all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Horizontal scroll */}
      <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
        <div className="flex gap-4" style={{ width: 'max-content' }}>
          {displayChannels.map((channel) => (
            <Link
              key={channel.id}
              to={`/channel/${channel.channel_id}`}
              className="flex-none w-[70px] text-center group"
            >
              {/* Channel Avatar */}
              <div className="relative mx-auto w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 group-hover:border-primary/60 transition-all duration-300">
                {channel.thumbnail_url ? (
                  <img
                    src={channel.thumbnail_url}
                    alt={channel.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-red-500 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {channel.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Channel Name */}
              <p className="mt-1.5 text-[10px] font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {channel.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
