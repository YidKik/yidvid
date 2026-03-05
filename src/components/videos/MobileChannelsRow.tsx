
import { Link } from "react-router-dom";
import { useChannelsGrid } from "@/hooks/channel/useChannelsGrid";
import { ChevronRight } from "lucide-react";
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

  // Show skeleton while loading instead of hiding the section
  if (isLoading) {
    return (
      <section className="mb-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Most Viewed Channels
          </h2>
        </div>
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (sortedChannels.length === 0) return null;

  return (
    <section className="mb-4">
      {/* Header - YouTube style, smaller */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Most Viewed Channels
        </h2>
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
        <div className="flex gap-3" style={{ width: 'max-content' }}>
          {sortedChannels.map((channel) => (
            <Link
              key={channel.id}
              to={`/channel/${channel.channel_id}`}
              className="flex-none w-[100px] group"
            >
              {/* Friendly card */}
              <div className="bg-card rounded-xl p-3 border border-border/50 hover:border-primary/40 transition-all text-center">
                {/* Channel Avatar - Bigger */}
                <div className="mx-auto w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm">
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
                <p className="mt-2 text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {channel.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
