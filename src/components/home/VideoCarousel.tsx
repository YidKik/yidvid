
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
    // Remove the 'speed' property as it's not supported in the options type
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
        // Use scrollTo instead of scrollBy which doesn't exist in the API
        // Calculate the position delta instead
        const currentPos = emblaApi.scrollProgress();
        const stepAmount = (scrollStep * speed * (dt / 16)) / 100; // Convert to percentage (0-1)
        const newPos = direction === "rtl" 
          ? currentPos - stepAmount 
          : currentPos + stepAmount;
          
        // Handle wraparound at boundaries (0-1)
        if (newPos >= 1) {
          emblaApi.scrollTo(0);
        } else if (newPos < 0) {
          emblaApi.scrollTo(1);
        } else {
          emblaApi.scrollTo(newPos);
        }
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
