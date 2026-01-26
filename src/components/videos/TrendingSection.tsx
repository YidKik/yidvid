
import { useMemo, useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useVideoDate } from "@/components/video/useVideoDate";

interface TrendingSectionProps {
  videos: VideoData[];
}

export const TrendingSection = ({ videos }: TrendingSectionProps) => {
  const { getFormattedDate } = useVideoDate();
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

  // Sort by views to get trending videos
  const trendingVideos = useMemo(() => {
    return [...videos]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 15);
  }, [videos]);

  if (!trendingVideos || trendingVideos.length === 0) return null;

  return (
    <section className="mb-8">
      {/* Header - YouTube style, smaller */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Trending Videos
        </h2>
        
        <div className="flex items-center gap-3">
          <a 
            href="/videos?sort=trending"
            className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
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

      {/* Same card style as Latest Videos */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {trendingVideos.map((video) => (
            <Link
              key={video.id}
              to={`/video/${video.video_id || video.id}`}
              className="flex-none w-[calc(20%-13px)] group"
            >
              {/* Thumbnail - rounded with yellow outline on hover */}
              <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-transparent group-hover:border-yellow-400 transition-all duration-300">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              
              {/* Video Info - clean layout like reference */}
              <div className="mt-3">
                {/* Title - bolder, friendly */}
                <h3 className="text-sm font-semibold font-friendly text-foreground line-clamp-2 leading-snug">
                  {video.title}
                </h3>
                {/* Channel with actual profile picture */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-muted">
                    {video.channelThumbnail ? (
                      <img
                        src={video.channelThumbnail}
                        alt={video.channel_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center text-[10px] font-bold text-white">
                        {video.channel_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {video.channel_name}
                  </p>
                </div>
                {/* Meta - cleaner */}
                <p className="text-xs text-muted-foreground/80 mt-1.5">
                  {video.views?.toLocaleString() || 0} views • {getFormattedDate(video.uploaded_at)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
