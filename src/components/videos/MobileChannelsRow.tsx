
import { Link } from "react-router-dom";
import { useChannelsGrid } from "@/hooks/channel/useChannelsGrid";
import { ChevronRight, Crown, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const MobileChannelsRow = () => {
  const { manuallyFetchedChannels: channels, isLoading } = useChannelsGrid();
  
  // Fetch video counts per channel to determine "most viewed"
  const { data: channelVideoCounts } = useQuery({
    queryKey: ["channel-video-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("channel_id, views")
        .is("deleted_at", null)
        .eq("content_analysis_status", "approved");
      
      if (error) throw error;
      
      // Aggregate views by channel
      const counts: Record<string, number> = {};
      data?.forEach(video => {
        counts[video.channel_id] = (counts[video.channel_id] || 0) + (video.views || 0);
      });
      return counts;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Sort channels by total views and take top 8
  const sortedChannels = useMemo(() => {
    if (!channels || !channelVideoCounts) return channels?.slice(0, 8) || [];
    
    return [...channels]
      .sort((a, b) => {
        const aViews = channelVideoCounts[a.channel_id] || 0;
        const bViews = channelVideoCounts[b.channel_id] || 0;
        return bViews - aViews;
      })
      .slice(0, 8);
  }, [channels, channelVideoCounts]);

  if (isLoading || sortedChannels.length === 0) return null;

  return (
    <section className="mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gradient-to-r from-primary to-yellow-500 text-primary-foreground px-2 py-0.5 rounded-full">
            <Crown className="w-3 h-3" />
            <span className="text-xs font-semibold">Top</span>
          </div>
          <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "'Quicksand', sans-serif" }}>
            Most Viewed Channels
          </h2>
        </div>
        <Link 
          to="/channels"
          className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-0.5"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Horizontal scroll */}
      <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
        <div className="flex gap-4" style={{ width: 'max-content' }}>
          {sortedChannels.map((channel, index) => (
            <Link
              key={channel.id}
              to={`/channel/${channel.channel_id}`}
              className="flex-none w-[90px] text-center group"
            >
              {/* Channel Avatar - Larger */}
              <div className="relative">
                {index < 3 && (
                  <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white z-10 shadow-md ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                  }`}>
                    {index + 1}
                  </div>
                )}
                <div className="relative mx-auto w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30 group-hover:border-primary transition-all duration-300 shadow-lg">
                  {channel.thumbnail_url ? (
                    <img
                      src={channel.thumbnail_url}
                      alt={channel.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-red-500 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {channel.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Channel Name */}
              <p className="mt-2 text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {channel.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
