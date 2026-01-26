
import { useMemo, useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { VideoCard } from "@/components/VideoCard";
import { VideoSectionHeader } from "./VideoSectionHeader";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { Sparkles } from "lucide-react";

interface NewVideosSectionProps {
  videos: VideoData[];
}

export const NewVideosSection = ({ videos }: NewVideosSectionProps) => {
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
    <section className="mb-8">
      {/* Custom header with "New" badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">New</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-foreground" style={{ fontFamily: "'Quicksand', sans-serif" }}>
            Latest Videos
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <a 
            href="/videos?sort=newest"
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

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {newVideos.map((video) => (
            <div
              key={video.id}
              className="flex-none w-[calc(20%-13px)]"
            >
              <VideoCard
                id={video.id}
                video_id={video.video_id}
                title={video.title}
                thumbnail={video.thumbnail}
                channelName={video.channel_name}
                channelId={video.channel_id}
                views={video.views}
                uploadedAt={video.uploaded_at}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
