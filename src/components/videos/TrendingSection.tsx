
import { useMemo, useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { TrendingUp, Play, Eye } from "lucide-react";

interface TrendingSectionProps {
  videos: VideoData[];
}

export const TrendingSection = ({ videos }: TrendingSectionProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 4,
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

  // Sort by views to get trending videos
  const trendingVideos = useMemo(() => {
    return [...videos]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 12);
  }, [videos]);

  if (!trendingVideos || trendingVideos.length === 0) return null;

  return (
    <section className="mb-8">
      {/* Custom header with Trending flame */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">Hot</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-foreground" style={{ fontFamily: "'Quicksand', sans-serif" }}>
            Trending Now
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <a 
            href="/videos?sort=trending"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-primary/5"
          >
            View all
          </a>
          
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
      </div>

      {/* Trending uses a different card style - horizontal cards */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {trendingVideos.map((video, index) => (
            <Link
              key={video.id}
              to={`/video/${video.video_id || video.id}`}
              className="flex-none w-[calc(25%-12px)] group"
            >
              <div className="flex gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 border border-border/30 hover:border-primary/30">
                {/* Rank Number */}
                <div className="flex-shrink-0 w-8 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${index < 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                    {index + 1}
                  </span>
                </div>
                
                {/* Thumbnail */}
                <div className="relative w-28 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {video.channel_name}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Eye className="w-3 h-3" />
                    <span>{video.views?.toLocaleString() || 0}</span>
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
