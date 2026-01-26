
import { useCallback, useEffect, useState, useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { useChannelsGrid } from "@/hooks/channel/useChannelsGrid";
import { ChevronLeft, ChevronRight, Crown, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ChannelsRowSectionProps {
  selectedCategory?: string;
}

export const ChannelsRowSection = ({ selectedCategory = "all" }: ChannelsRowSectionProps) => {
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

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 5,
    containScroll: "trimSnaps",
    dragFree: false,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Sort channels by total views and take top 10
  const sortedChannels = useMemo(() => {
    if (!channels || !channelVideoCounts) return channels?.slice(0, 10) || [];
    
    return [...channels]
      .sort((a, b) => {
        const aViews = channelVideoCounts[a.channel_id] || 0;
        const bViews = channelVideoCounts[b.channel_id] || 0;
        return bViews - aViews;
      })
      .slice(0, 10);
  }, [channels, channelVideoCounts]);

  if (isLoading || sortedChannels.length === 0) return null;

  return (
    <section className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-gradient-to-r from-primary to-yellow-500 text-primary-foreground px-3 py-1 rounded-full">
            <Crown className="w-4 h-4" />
            <span className="text-sm font-semibold">Top</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-foreground" style={{ fontFamily: "'Quicksand', sans-serif" }}>
            Most Viewed Channels
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            to="/channels"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-primary/5"
          >
            View all
          </Link>
          
          <div className="flex gap-1.5">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                canScrollPrev 
                  ? 'bg-muted hover:bg-muted/80 text-foreground' 
                  : 'bg-muted/30 text-muted-foreground/30 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                canScrollNext 
                  ? 'bg-muted hover:bg-muted/80 text-foreground' 
                  : 'bg-muted/30 text-muted-foreground/30 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {sortedChannels.map((channel, index) => (
            <Link
              key={channel.id}
              to={`/channel/${channel.channel_id}`}
              className="flex-none w-[140px] group text-center"
            >
              {/* Channel Card - Larger, more visible */}
              <div className="relative">
                {/* Rank badge for top 3 */}
                {index < 3 && (
                  <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white z-10 shadow-md ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                  }`}>
                    {index + 1}
                  </div>
                )}
                
                {/* Channel Avatar - Larger */}
                <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden border-3 border-primary/30 group-hover:border-primary transition-all duration-300 group-hover:scale-105 shadow-lg group-hover:shadow-xl">
                  {channel.thumbnail_url ? (
                    <img
                      src={channel.thumbnail_url}
                      alt={channel.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-red-500 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {channel.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* Play overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
              </div>
              
              {/* Channel Name */}
              <p className="mt-3 text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {channel.title}
              </p>
              
              {/* View Count */}
              <p className="text-xs text-muted-foreground mt-0.5">
                {channelVideoCounts?.[channel.channel_id]?.toLocaleString() || 0} views
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
