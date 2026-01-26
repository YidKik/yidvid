
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { useChannelsGrid } from "@/hooks/channel/useChannelsGrid";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";

interface ChannelsRowSectionProps {
  selectedCategory?: string;
}

export const ChannelsRowSection = ({ selectedCategory = "all" }: ChannelsRowSectionProps) => {
  const { manuallyFetchedChannels: channels, isLoading } = useChannelsGrid();
  const [showAllChannels, setShowAllChannels] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  
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
    containScroll: "keepSnaps",
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

  // Sort channels by total views
  const allSortedChannels = useMemo(() => {
    if (!channels || !channelVideoCounts) return channels || [];
    
    return [...channels]
      .sort((a, b) => {
        const aViews = channelVideoCounts[a.channel_id] || 0;
        const bViews = channelVideoCounts[b.channel_id] || 0;
        return bViews - aViews;
      });
  }, [channels, channelVideoCounts]);

  // Top 10 for carousel view
  const sortedChannels = useMemo(() => {
    return allSortedChannels.slice(0, 10);
  }, [allSortedChannels]);

  // Handle View All click - expand and scroll to top of page
  const handleViewAllClick = () => {
    setShowAllChannels(true);
   // Scroll so the first row of channel cards is at the top of the viewport
    setTimeout(() => {
     sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // Handle Back click - collapse and stay at section
  const handleBackClick = () => {
    setShowAllChannels(false);
    // Scroll back to section
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  if (isLoading || sortedChannels.length === 0) return null;

  // Channel Card Component for reuse
  const ChannelCard = ({ channel, index, isGrid = false }: { channel: any; index: number; isGrid?: boolean }) => (
    <motion.div
      initial={isGrid ? { opacity: 0, y: 20, scale: 0.95 } : false}
      animate={isGrid ? { opacity: 1, y: 0, scale: 1 } : false}
      transition={isGrid ? { 
        duration: 0.35, 
        delay: index * 0.02,
        ease: [0.25, 0.46, 0.45, 0.94]
      } : undefined}
    >
      <Link
        to={`/channel/${channel.channel_id}`}
        className={`block group ${isGrid ? 'w-full' : 'flex-none w-[210px]'}`}
      >
        <div className="bg-card rounded-2xl p-7 shadow-md transition-all duration-300 text-center">
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
          
          <p className="mt-4 text-sm font-semibold text-foreground truncate group-hover:text-yellow-500 transition-colors">
            {channel.title}
          </p>
          
          <p className="text-xs text-muted-foreground mt-1.5">
            {channelVideoCounts?.[channel.channel_id]?.toLocaleString() || 0} views
          </p>
        </div>
      </Link>
    </motion.div>
  );

  return (
    <section 
      ref={sectionRef}
      className={`mb-10 py-10 -mx-6 px-6 bg-gradient-to-br from-yellow-50/80 via-orange-50/50 to-red-50/30 dark:from-yellow-900/10 dark:via-orange-900/5 dark:to-red-900/5 ${showAllChannels ? 'min-h-screen pb-20' : 'rounded-3xl shadow-sm'}`}
    >
      <AnimatePresence mode="wait">
        {showAllChannels ? (
          /* Expanded Grid View - Shows all channels including first row */
          <motion.div
            key="all-channels"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header with Back button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackClick}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-full transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <h2 className="text-lg font-semibold text-foreground font-friendly">
                  All Channels
                </h2>
              </div>
              <span className="text-sm text-muted-foreground">
                {allSortedChannels.length} channels
              </span>
            </div>

            {/* Grid of all channels */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {allSortedChannels.map((channel, index) => (
                <ChannelCard 
                  key={channel.id} 
                  channel={channel} 
                  index={index}
                  isGrid={true}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          /* Normal Carousel View */
          <motion.div
            key="carousel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
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

            <div className="overflow-hidden py-3" ref={emblaRef}>
              <div className="flex gap-4">
                {sortedChannels.map((channel, index) => (
                  <ChannelCard 
                    key={channel.id} 
                    channel={channel} 
                    index={index}
                    isGrid={false}
                  />
                ))}
              </div>
            </div>

            {/* View All Button - Bottom center, friendly and visible */}
            <div className="flex justify-center mt-8">
              <button 
                onClick={handleViewAllClick}
                className="px-8 py-3 text-base font-friendly font-semibold text-foreground hover:text-white bg-yellow-400/20 hover:bg-yellow-400 border-2 border-yellow-400 rounded-full transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-yellow-400/30"
              >
                View All Channels
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
