
import { useCallback, useEffect, useState, useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { useChannelsGrid } from "@/hooks/channel/useChannelsGrid";
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
    <section className="mb-10 py-8 -mx-6 px-6 bg-gradient-to-b from-slate-50/70 via-gray-50/50 to-transparent dark:from-slate-800/20 dark:via-gray-800/10 dark:to-transparent border-t border-muted/30">
      {/* Header - YouTube style, smaller */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Most Viewed Channels
        </h2>
        
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="overflow-visible py-3" ref={emblaRef}>
        <div className="flex gap-6">
          {sortedChannels.map((channel) => (
            <Link
              key={channel.id}
              to={`/channel/${channel.channel_id}`}
              className="flex-none w-[210px] group"
            >
              {/* Channel Card - Bigger with more padding, no border, subtle shadow */}
              <div className="bg-card rounded-2xl p-7 shadow-md transition-all duration-300 text-center">
                {/* Channel Avatar - Bigger with yellow border on hover */}
                <div className="relative mx-auto w-28 h-28 rounded-full overflow-hidden border-[3px] border-transparent group-hover:border-yellow-400 transition-all duration-300 ring-2 ring-muted/30 group-hover:ring-yellow-400/50">
                  {channel.thumbnail_url ? (
                    <img
                      src={channel.thumbnail_url}
                      alt={channel.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {channel.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Channel Name */}
                <p className="mt-4 text-sm font-semibold text-foreground truncate group-hover:text-yellow-500 transition-colors">
                  {channel.title}
                </p>
                
                {/* View Count */}
                <p className="text-xs text-muted-foreground mt-1.5">
                  {channelVideoCounts?.[channel.channel_id]?.toLocaleString() || 0} views
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* View All Button - Bottom center, friendly and visible */}
      <div className="flex justify-center mt-8">
        <Link 
          to="/channels"
          className="px-8 py-3 text-base font-friendly font-semibold text-foreground hover:text-white bg-yellow-400/20 hover:bg-yellow-400 border-2 border-yellow-400 rounded-full transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-yellow-400/30"
        >
          View All Channels
        </Link>
      </div>
    </section>
  );
};
