
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { VideoCard } from "@/components/VideoCard";
import { VideoSectionHeader } from "./VideoSectionHeader";
import { VideoData } from "@/hooks/video/types/video-fetcher";

interface VideoCarouselSectionProps {
  title: string;
  videos: VideoData[];
  seeAllLink?: string;
  videosPerView?: number;
}

export const VideoCarouselSection = ({
  title,
  videos,
  seeAllLink,
  videosPerView = 5,
}: VideoCarouselSectionProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: videosPerView,
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

  if (!videos || videos.length === 0) return null;

  return (
    <section className="mb-8">
      <VideoSectionHeader
        title={title}
        seeAllLink={seeAllLink}
        onPrevious={scrollPrev}
        onNext={scrollNext}
        canScrollPrev={canScrollPrev}
        canScrollNext={canScrollNext}
      />

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex-none"
              style={{ width: `calc((100% - ${(videosPerView - 1) * 16}px) / ${videosPerView})` }}
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
