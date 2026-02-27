
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { useChannelsGrid } from "@/hooks/channel/useChannelsGrid";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChannelsRowSectionProps {
  selectedCategory?: string;
  autoExpand?: boolean;
}

export const ChannelsRowSection = ({ selectedCategory = "all", autoExpand = false }: ChannelsRowSectionProps) => {
  const { manuallyFetchedChannels: channels, isLoading } = useChannelsGrid();
  const { isMobile, isTablet } = useIsMobile();
  const [showAllChannels, setShowAllChannels] = useState(autoExpand);
  const [hasAnimated, setHasAnimated] = useState(autoExpand);
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasAutoExpanded = useRef(false);

  // Auto-expand and scroll when autoExpand prop is true
  useEffect(() => {
    if (autoExpand && !hasAutoExpanded.current && !isLoading && channels && channels.length > 0) {
      hasAutoExpanded.current = true;
      setShowAllChannels(true);
      setHasAnimated(true);
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [autoExpand, isLoading, channels]);
  
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
    slidesToScroll: 2,
    containScroll: "trimSnaps",
    dragFree: false,
    duration: 45,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(false), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(false), [emblaApi]);

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

  // Show more channels in carousel (up to 20)
  const sortedChannels = useMemo(() => {
    return allSortedChannels.slice(0, 20);
  }, [allSortedChannels]);

  // Handle View All click - expand and scroll to top of page
  const handleViewAllClick = () => {
    setShowAllChannels(true);
   // Scroll so the first row of channel cards is at the top of the viewport
    setTimeout(() => {
     sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
     // Mark animation as complete after it plays
     setTimeout(() => setHasAnimated(true), 800);
    }, 50);
  };

  // Handle Back click - collapse and stay at section
  const handleBackClick = () => {
    setShowAllChannels(false);
    setHasAnimated(false); // Reset animation state for next time
    // Scroll back to section
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // Show skeleton while loading instead of hiding the section
  if (isLoading) {
    return (
      <section className={`mb-10 ${isMobile ? 'py-6 -mx-3 px-3' : 'py-10 -mx-6 px-6'} bg-gray-50 dark:bg-gray-900/30 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Most Viewed Channels
          </h2>
        </div>
        <div className="flex gap-4 overflow-hidden py-3">
          {Array.from({ length: isMobile ? 3 : 6 }).map((_, i) => (
            <div key={i} className={`flex-none ${isMobile ? 'w-[140px]' : 'w-[210px]'} bg-card rounded-2xl ${isMobile ? 'p-4' : 'p-7'} shadow-md text-center animate-pulse`}>
              <div className={`mx-auto ${isMobile ? 'w-16 h-16' : 'w-28 h-28'} rounded-full bg-muted`} />
              <div className="mt-4 h-4 bg-muted rounded w-3/4 mx-auto" />
              <div className="mt-2 h-3 bg-muted rounded w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (sortedChannels.length === 0) return null;

  // Channel Card Component for reuse
  // Skip animation for first 12 cards (first 2 rows on largest grid) and after initial animation
  const ChannelCard = ({ channel, index, isGrid = false }: { channel: any; index: number; isGrid?: boolean }) => {
    const shouldAnimate = isGrid && index >= 12 && !hasAnimated;
    
    return (
      <motion.div
        initial={shouldAnimate ? { opacity: 0, y: 20, scale: 0.95 } : { opacity: 1, y: 0, scale: 1 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={shouldAnimate ? { 
          duration: 0.35, 
          delay: (index - 12) * 0.02,
          ease: [0.25, 0.46, 0.45, 0.94]
        } : { duration: 0 }}
      >
      <Link
        to={`/channel/${channel.channel_id}`}
      className={`block group ${isGrid ? 'w-full' : `flex-none ${isMobile ? 'w-[140px]' : isTablet ? 'w-[170px]' : 'w-[210px]'}`}`}
    >
        <div className={`bg-card rounded-2xl ${isMobile ? 'p-4' : 'p-7'} shadow-md transition-all duration-300 text-center`}>
          <div className={`relative mx-auto ${isMobile ? 'w-16 h-16' : isTablet ? 'w-20 h-20' : 'w-28 h-28'} rounded-full overflow-hidden border-2 border-transparent group-hover:border-yellow-400 transition-all duration-300 ring-2 ring-muted/30 group-hover:ring-yellow-400/50`}>
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
          
          <p className="mt-4 text-sm font-semibold text-foreground truncate">
            {channel.title}
          </p>
          
          <p className="text-xs text-muted-foreground mt-1.5">
            {isGrid ? 'View Channel' : `${channelVideoCounts?.[channel.channel_id]?.toLocaleString() || 0} views`}
          </p>
        </div>
      </Link>
      </motion.div>
    );
  };
  return (
    <section 
      ref={sectionRef}
      className={`mb-10 py-10 -mx-6 px-6 bg-gray-50 dark:bg-gray-900/30 ${showAllChannels ? 'min-h-screen pb-20' : 'rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800'}`}
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
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <h2 className="text-lg font-semibold text-foreground font-friendly">
                  All Channels
                </h2>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
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
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Most Viewed Channels
              </h2>
              
              <div className="flex gap-2">
                <button
                  onClick={scrollPrev}
                  disabled={!canScrollPrev}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                    canScrollPrev 
                      ? 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:scale-110' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={scrollNext}
                  disabled={!canScrollNext}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                    canScrollNext 
                      ? 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:scale-110' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
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

            {/* View All Button */}
            <div className="flex justify-center mt-8">
              <button 
                onClick={handleViewAllClick}
                className="px-8 py-3 text-base font-friendly font-semibold text-gray-900 bg-yellow-400 hover:bg-yellow-500 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
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
