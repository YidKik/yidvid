
import { useMemo, useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useVideoDate } from "@/components/video/useVideoDate";

interface NewVideosSectionProps {
  videos: VideoData[];
}

export const NewVideosSection = ({ videos }: NewVideosSectionProps) => {
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

  // Sort by upload date to get newest videos
  const newVideos = useMemo(() => {
    return [...videos]
      .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
      .slice(0, 15);
  }, [videos]);

  if (!newVideos || newVideos.length === 0) return null;

  return (
    <section className="mb-8 py-6 px-4 -mx-4 bg-muted/30 rounded-xl">
      {/* Header - YouTube style, smaller */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Latest Videos
        </h2>
        
        <div className="flex items-center gap-3">
          <a 
            href="/videos?sort=newest"
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
                  ? 'bg-background hover:bg-muted text-foreground' 
                  : 'bg-background/50 text-muted-foreground/30 cursor-not-allowed'
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
                  ? 'bg-background hover:bg-muted text-foreground' 
                  : 'bg-background/50 text-muted-foreground/30 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {newVideos.map((video) => (
            <Link
              key={video.id}
              to={`/video/${video.video_id || video.id}`}
              className="flex-none w-[calc(20%-13px)] group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              
              {/* Video Info */}
              <div className="mt-3 flex gap-2">
                {/* Channel Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-red-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {video.channel_name.charAt(0).toUpperCase()}
                </div>
                
                <div className="min-w-0 flex-1">
                  {/* Title */}
                  <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  {/* Channel Name */}
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {video.channel_name}
                  </p>
                  {/* Meta */}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {getFormattedDate(video.uploaded_at)} • {video.views?.toLocaleString() || 0} views
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
