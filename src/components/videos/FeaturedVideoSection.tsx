
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";

interface FeaturedVideoSectionProps {
  videos: VideoData[];
}

export const FeaturedVideoSection = ({ videos }: FeaturedVideoSectionProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
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

  // Take top 6 videos for featured section
  const featuredVideos = videos.slice(0, 6);

  if (!featuredVideos || featuredVideos.length === 0) return null;

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl md:text-2xl font-bold text-foreground" style={{ fontFamily: "'Quicksand', sans-serif" }}>
          Featured
        </h2>
        
        {/* Navigation - custom styled */}
        <div className="flex items-center gap-2">
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
              canScrollPrev 
                ? 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30' 
                : 'bg-muted/50 text-muted-foreground/40 cursor-not-allowed border border-transparent'
            }`}
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
              canScrollNext 
                ? 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30' 
                : 'bg-muted/50 text-muted-foreground/40 cursor-not-allowed border border-transparent'
            }`}
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5">
          {featuredVideos.map((video) => (
            <Link
              key={video.id}
              to={`/video/${video.video_id || video.id}`}
              className="flex-none w-[calc(33.333%-14px)] group"
            >
              {/* Featured Card - Larger with more info */}
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Play Button on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 text-primary-foreground fill-primary-foreground ml-1" />
                  </div>
                </div>
                
                {/* Title at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-base md:text-lg line-clamp-2 group-hover:text-primary transition-colors drop-shadow-md">
                    {video.title}
                  </h3>
                </div>
              </div>
              
              {/* Channel Info Below Card */}
              <div className="mt-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-red-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {video.channel_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {video.channel_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {video.views?.toLocaleString() || 0} views
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
