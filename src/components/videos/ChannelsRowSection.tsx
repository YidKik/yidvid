
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { VideoSectionHeader } from "./VideoSectionHeader";
import { useChannelsGrid } from "@/hooks/channel/useChannelsGrid";
import { Play } from "lucide-react";

interface ChannelsRowSectionProps {
  selectedCategory?: string;
}

export const ChannelsRowSection = ({ selectedCategory = "all" }: ChannelsRowSectionProps) => {
  const { manuallyFetchedChannels: channels, isLoading } = useChannelsGrid();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 6,
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

  // Limit to first 12 channels for the row display
  const displayChannels = channels?.slice(0, 12) || [];

  if (isLoading || displayChannels.length === 0) return null;

  return (
    <section className="mb-8">
      <VideoSectionHeader
        title="Recently Added Channels"
        seeAllLink="/channels"
        onPrevious={scrollPrev}
        onNext={scrollNext}
        canScrollPrev={canScrollPrev}
        canScrollNext={canScrollNext}
      />

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {displayChannels.map((channel) => (
            <Link
              key={channel.id}
              to={`/channel/${channel.channel_id}`}
              className="flex-none w-[100px] group text-center"
            >
              {/* Channel Avatar */}
              <div className="relative mx-auto w-20 h-20 rounded-full overflow-hidden border-3 border-primary/20 group-hover:border-primary/60 transition-all duration-300 group-hover:scale-105 shadow-md group-hover:shadow-lg">
                {channel.thumbnail_url ? (
                  <img
                    src={channel.thumbnail_url}
                    alt={channel.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-red-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {channel.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Play overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-6 h-6 text-white fill-white" />
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
