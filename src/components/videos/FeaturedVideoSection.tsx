
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useVideoDate } from "@/components/video/useVideoDate";
import { useIsMobile } from "@/hooks/use-mobile";
import yidvidLogoIcon from "@/assets/yidvid-logo-icon.png";

interface FeaturedVideoSectionProps {
  videos: VideoData[];
}

export const FeaturedVideoSection = ({ videos }: FeaturedVideoSectionProps) => {
  const { getFormattedDate } = useVideoDate();
  const { isMobile, isTablet } = useIsMobile();
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
      {/* Header - YouTube style, smaller font */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Featured
        </h2>
        
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              canScrollPrev 
                ? 'bg-muted hover:bg-muted/80 text-foreground' 
                : 'bg-muted/30 text-muted-foreground/30 cursor-not-allowed'
            }`}
            aria-label="Previous"
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
            aria-label="Next"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5">
          {featuredVideos.map((video) => (
            <Link
              key={video.id}
              to={`/video/${video.video_id || video.id}`}
              className={`flex-none group ${isMobile ? 'w-[85%]' : isTablet ? 'w-[calc(50%-10px)]' : 'w-[calc(33.333%-14px)]'}`}
            >
              {/* Featured Card - Solid yellow border always */}
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-yellow-400">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Play Button on Hover - YidVid Logo */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className={`${isMobile ? 'w-14 h-14' : 'w-[68px] h-[68px]'} rounded-full bg-yellow-400 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform`}>
                    <img 
                      src={yidvidLogoIcon} 
                      alt="Play" 
                      className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} object-contain`}
                      style={{ 
                        filter: 'brightness(0) saturate(100%)'
                      }}
                    />
                  </div>
                </div>
                
                {/* Content at Bottom */}
                <div className={`absolute bottom-0 left-0 right-0 ${isMobile ? 'p-2' : 'p-2 md:p-2.5 xl:p-4'}`}>
                  <h3 className={`text-white font-semibold line-clamp-2 group-hover:text-yellow-400 transition-colors drop-shadow-md ${isMobile ? 'text-[11px]' : 'text-[10px] md:text-[11px] lg:text-xs xl:text-base'}`}>
                    {video.title}
                  </h3>
                  <p className={`text-white/80 mt-0.5 truncate ${isMobile ? 'text-[9px]' : 'text-[8px] md:text-[9px] lg:text-[10px] xl:text-sm'}`}>
                    {video.channel_name}
                  </p>
                  <div className={`flex items-center gap-1.5 text-white/60 mt-0.5 ${isMobile ? 'text-[8px]' : 'text-[7px] md:text-[8px] lg:text-[9px] xl:text-xs'}`}>
                    <span>{getFormattedDate(video.uploaded_at)}</span>
                    <span>•</span>
                    <span>{video.views?.toLocaleString() || 0} views</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
