
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { VideoSectionHeader } from "./VideoSectionHeader";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { Play } from "lucide-react";

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

  // Take top 4 videos for featured section (most views or most recent)
  const featuredVideos = videos.slice(0, 4);

  if (!featuredVideos || featuredVideos.length === 0) return null;

  return (
    <section className="mb-8">
      <VideoSectionHeader
        title="Featured"
        onPrevious={scrollPrev}
        onNext={scrollNext}
        canScrollPrev={canScrollPrev}
        canScrollNext={canScrollNext}
      />

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {featuredVideos.map((video) => (
            <Link
              key={video.id}
              to={`/video/${video.video_id || video.id}`}
              className="flex-none w-[calc(25%-12px)] group relative"
            >
              {/* Featured Card with Overlay */}
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Play Button on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-primary-foreground fill-primary-foreground ml-1" />
                  </div>
                </div>
                
                {/* Channel Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-red-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {video.channel_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white text-xs font-medium truncate max-w-[120px]">
                    {video.channel_name}
                  </span>
                </div>
                
                {/* Title at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
