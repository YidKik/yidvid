
import React, { useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import useEmblaCarousel from "embla-carousel-react";
import { VideoGridItem as VideoGridItemType } from "@/hooks/video/useVideoGridData";
import { VideoGridItem } from "@/components/video/VideoGridItem";

interface VideoCarouselProps {
  videos: VideoGridItemType[];
  direction: "ltr" | "rtl";
  speed: number;
}

// NO section title, minimal thumbnail only
export const VideoCarousel = ({ videos, direction, speed }: VideoCarouselProps) => {
  const { isMobile } = useIsMobile();

  // Set up Embla carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: true,
    containScroll: "trimSnaps",
    direction: direction === "rtl" ? "rtl" : "ltr",
    align: "start",
  });

  const scrolling = useRef<boolean>(false);

  // Auto-play effect
  useEffect(() => {
    if (!emblaApi || videos.length === 0) return;

    emblaApi.reInit();

    if (scrolling.current) return;

    const autoplay = setInterval(() => {
      if (!scrolling.current && emblaApi) {
        emblaApi.scrollNext();
      }
    }, 50000 / speed);

    return () => {
      clearInterval(autoplay);
    };
  }, [emblaApi, videos, speed]);

  // Handle scroll start/stop
  useEffect(() => {
    if (!emblaApi) return;

    const onPointerDown = () => {
      scrolling.current = true;
    };

    const onPointerUp = () => {
      scrolling.current = false;
    };

    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("pointerUp", onPointerUp);

    return () => {
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("pointerUp", onPointerUp);
    };
  }, [emblaApi]);

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <div className="px-2 md:px-4">
      {/* Video carousel - only thumbnails, no info/overlay */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3 md:gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className={`flex-[0_0_${isMobile ? "75%" : "300px"}] min-w-0`}
              style={{ flex: `0 0 ${isMobile ? "75%" : "300px"}` }}
            >
              <VideoGridItem video={video} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
