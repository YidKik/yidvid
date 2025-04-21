
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

function* createShuffler(array: any[]) {
  let arr = [...array];
  while (true) {
    for (let i = 0; i < arr.length; i++) {
      yield arr[i];
    }
    // Shuffle for next round
    arr = arr
      .map((value: any) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }
}

export const VideoCarousel = ({
  videos,
  direction,
  speed,
  shuffleKey
}: VideoCarouselProps) => {
  const { isMobile } = useIsMobile();

  // Use generator for lazy shuffle cycling
  const [shuffledVideos, setShuffledVideos] = useState<VideoGridItemType[]>([]);
  const shufflerRef = useRef<ReturnType<typeof createShuffler>>();

  useEffect(() => {
    shufflerRef.current = createShuffler(videos);
    // Prime the initial set of shuffled videos for display
    setShuffledVideos(
      Array.from({ length: Math.max(8, isMobile ? 4 : 8) }, () =>
        shufflerRef.current!.next().value
      )
    );
  }, [videos, isMobile, shuffleKey]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: true,
    containScroll: "trimSnaps",
    direction: direction === "rtl" ? "rtl" : "ltr",
    align: "start",
  });

  const scrolling = useRef<boolean>(false);
  const reqRef = useRef<number>();
  const scrollStep = isMobile ? 0.8 : 1.6; // px/frame for smoothness (not used directly, we're using scrollTo)

  // Continuous auto-scroll & live shuffle.
  useEffect(() => {
    if (!emblaApi || shuffledVideos.length === 0) return;
    emblaApi.reInit();

    let last = performance.now();

    const animate = (time: number) => {
      if (!scrolling.current && emblaApi) {
        const dt = Math.min(28, time - last); // cap for safety
        last = time;

        // Use scrollProgress for [0,1], scrollTo works with fractional slide index!
        const currentProgress = emblaApi.scrollProgress();
        const slideCount = emblaApi.slideNodes().length;
        const stepAmount = (0.011 * speed * (dt / 16)); // Tune for smoothness

        let newProgress =
          direction === "rtl"
            ? currentProgress - stepAmount
            : currentProgress + stepAmount;

        if (newProgress >= 1) {
          emblaApi.scrollTo(0);
        } else if (newProgress < 0) {
          emblaApi.scrollTo(1);
        } else {
          emblaApi.scrollTo(newProgress);
        }

        // LIVE shuffle: every second, rotate the videos array (simulate continuous shuffle)
        if (Math.floor(time / 1200) !== Math.floor((time - dt) / 1200) && shufflerRef.current) {
          const videosOnScreen = shuffledVideos.length;
          setShuffledVideos(
            Array.from({ length: videosOnScreen }, () => shufflerRef.current!.next().value)
          );
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
    // eslint-disable-next-line
  }, [emblaApi, direction, speed, shuffledVideos, isMobile, videos, shuffleKey]);

  // Handle drag interrupts to pause auto-scroll
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

  // Thumbnail dimensions (YouTube 16:9): width 320px, height 180px on desktop, ~75vw x 42vw on mobile
  const DESKTOP_WIDTH = 320;
  const DESKTOP_HEIGHT = 180;
  const MOBILE_WIDTH = "75vw";
  const MOBILE_HEIGHT = "42vw";

  return (
    <div className="px-2 md:px-4">
      {/* Minimal carousel: only thumbnails, no overlays or info */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3 md:gap-4 items-center">
          {shuffledVideos.map((video, idx) => (
            <div
              key={video.id + "-" + idx}
              className="min-w-0"
              style={{
                flex: `0 0 ${isMobile ? MOBILE_WIDTH : `${DESKTOP_WIDTH}px`}`,
                width: isMobile ? MOBILE_WIDTH : `${DESKTOP_WIDTH}px`,
                height: isMobile ? MOBILE_HEIGHT : `${DESKTOP_HEIGHT}px`,
                aspectRatio: "16/9"
              }}
            >
              <VideoGridItem video={video} clickable />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
