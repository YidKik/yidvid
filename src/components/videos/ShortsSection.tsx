
import { useMemo, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useShorts } from "@/hooks/video/useShorts";

export const ShortsSection = () => {
  const { shorts, isLoading } = useShorts();
  const { isMobile, isTablet } = useIsMobile();
  const navigate = useNavigate();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: isMobile ? 3 : 6,
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

  const displayShorts = useMemo(() => {
    return shorts.slice(0, 30);
  }, [shorts]);

  if (isLoading || displayShorts.length === 0) return null;

  const formatViews = (views: number) => {
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(0)}K`;
    return views.toString();
  };

  return (
    <section className={`${isMobile ? 'py-4 -mx-3 px-3' : 'py-6 -mx-6 px-6'} rounded-3xl`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center">
            <Play className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Shorts
          </h2>
        </div>

        <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={`${isMobile ? 'w-6 h-6' : isTablet ? 'w-7 h-7' : 'w-9 h-9'} rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
              canScrollPrev
                ? 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:scale-110'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className={isMobile ? 'w-3.5 h-3.5' : isTablet ? 'w-4 h-4' : 'w-5 h-5'} />
          </button>
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className={`${isMobile ? 'w-6 h-6' : isTablet ? 'w-7 h-7' : 'w-9 h-9'} rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
              canScrollNext
                ? 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:scale-110'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <ChevronRight className={isMobile ? 'w-3.5 h-3.5' : isTablet ? 'w-4 h-4' : 'w-5 h-5'} />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className={`flex ${isMobile ? 'gap-2' : 'gap-3'}`}>
          {displayShorts.map((short) => (
            <ShortCard key={short.id} short={short} isMobile={isMobile} isTablet={isTablet} formatViews={formatViews} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ShortCard = ({
  short,
  isMobile,
  isTablet,
  formatViews,
}: {
  short: VideoData;
  isMobile: boolean;
  isTablet: boolean;
  formatViews: (v: number) => string;
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={`flex-none cursor-pointer group ${
        isMobile ? 'w-[120px]' : isTablet ? 'w-[140px]' : 'w-[165px]'
      }`}
      onClick={() => navigate(`/shorts/${short.video_id}`)}
    >
      {/* Thumbnail - 9:16 aspect ratio */}
      <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: '9/16' }}>
        <img
          src={short.thumbnail}
          alt={short.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
        {/* Views badge */}
        {short.views != null && short.views > 0 && (
          <span className={`absolute bottom-2 left-2 ${isMobile ? 'text-[9px]' : 'text-[10px]'} font-medium text-white/90`}>
            {formatViews(short.views)} views
          </span>
        )}
        {/* Play icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
        </div>
      </div>
      {/* Title */}
      <p className={`mt-2 ${isMobile ? 'text-[11px]' : 'text-xs'} font-medium text-foreground line-clamp-2 leading-tight`}>
        {short.title}
      </p>
    </div>
  );
};
