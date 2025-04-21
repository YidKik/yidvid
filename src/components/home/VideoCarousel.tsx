
import React, { useRef, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import useEmblaCarousel from "embla-carousel-react";
import { VideoGridItem as VideoGridItemType } from "@/hooks/video/useVideoGridData";
import { VideoGridItem } from "@/components/video/VideoGridItem";

interface VideoCarouselProps {
  videos: VideoGridItemType[];
  direction: "ltr" | "rtl";
  speed: number;
  shuffleKey?: number;
}

export const VideoCarousel = ({ videos, direction, speed, shuffleKey }: VideoCarouselProps) => {
  const { isMobile } = useIsMobile();

  // Shuffle videos once on mount and when shuffleKey changes
  const [shuffledVideos, setShuffledVideos] = useState<VideoGridItemType[]>([]);
  useEffect(() => {
    // Shuffle utility
    function shuffle<T>(array: T[]): T[] {
      return array
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
    }
    setShuffledVideos(shuffle(videos));
  }, [videos, shuffleKey]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: true,
    containScroll: "trimSnaps",
    direction: direction === "rtl" ? "rtl" : "ltr",
    align: "start",
    speed: 10,
  });

  const scrolling = useRef<boolean>(false);
  const reqRef = useRef<number>();
  const scrollStep = isMobile ? 0.45 : 0.9; // Amount to scroll per frame (adjust for smoothness)

  // Continuous smooth auto-scroll (use RAF, not setInterval, for maximum smoothness)
  useEffect(() => {
    if (!emblaApi || shuffledVideos.length === 0) return;
    emblaApi.reInit();

    let last = performance.now();

    const animate = (time: number) => {
      if (!scrolling.current && emblaApi) {
        const dt = Math.min(28, time - last); // max cap = 28ms for safety
        last = time;
        // emblaApi.scrollBy expects px, so we do a tiny step for smoothness
        emblaApi.scrollBy((direction === "rtl" ? -1 : 1) * (scrollStep * speed * (dt / 16)));
      }
      reqRef.current = requestAnimationFrame(animate);
    };

    reqRef.current = requestAnimationFrame(animate);
    return () => {
      if (reqRef.current) {
        cancelAnimationFrame(reqRef.current);
      }
    };
  }, [emblaApi, direction, speed, shuffledVideos, isMobile, scrollStep]);

  // Handle user drag interrupts to pause auto-scroll
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

  if (!shuffledVideos || shuffledVideos.length === 0) {
    return null;
  }

  return (
    <div className="px-2 md:px-4">
      {/* Minimal carousel: only thumbnails, no overlays or info */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3 md:gap-4">
          {shuffledVideos.map((video) => (
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
