
import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { useMemo } from "react";

/**
 * Single video thumbnail for grid (original size)
 */
function VideoGridThumb({
  thumbnail,
  className = "",
  style = {},
}: {
  thumbnail: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-md bg-white aspect-[16/11] w-28 md:w-36 lg:w-40 shadow-none ${className}`}
      style={{
        overflow: "hidden",
        background: "#fff",
        ...style,
      }}
    >
      <img
        src={thumbnail}
        alt=""
        className="w-full h-full object-cover"
        draggable={false}
        loading="lazy"
      />
    </div>
  );
}

const GRID_COLS = 4;
const VISIBLE_SLIDES = 4; // Number of videos visible at a time in the vertical columns
const SLIDE_HEIGHT_REM = 5.5; // Height for one slide (row)
const GAP_REM = 1.25; // Gap between slides
const TOTAL_CYCLE_VIDEOS = 40; // Number of unique videos to ensure smooth scroll (more than needed for better variety)

/**
 * Vertical CarouselColumn: Seamless vertical scroll of N videos with an offset.
 */
function CarouselColumn({
  videoList,
  visibleSlides = VISIBLE_SLIDES,
  offsetIndex = 0,
  animationDelay = 0,
  speed = 1,
}: {
  videoList: Array<{ id: string; thumbnail: string }>;
  visibleSlides?: number;
  offsetIndex?: number;
  animationDelay?: number;
  speed?: number;
}) {
  // Create an offset (cycled) display list for this column
  const displayList = useMemo(() => {
    if (videoList.length === 0) {
      return Array(visibleSlides).fill({ id: "fake", thumbnail: "/placeholder.svg" });
    }
    // Cycle offset for visual difference between columns
    const looped = videoList
      .slice(offsetIndex)
      .concat(videoList.slice(0, offsetIndex));
    // To ensure seamless scrolling, repeat the first 'visibleSlides' at the end
    return [...looped, ...looped.slice(0, visibleSlides)];
  }, [videoList, offsetIndex, visibleSlides]);

  // Animation distances
  const slideSizeRem = SLIDE_HEIGHT_REM + GAP_REM;
  const totalSlides = displayList.length;
  const animationDistance = slideSizeRem * totalSlides;

  // Animation duration: slower for smooth feel, can vary per column
  const SLIDE_DURATION_SEC = 6 / speed; // seconds per slide
  const totalDuration = SLIDE_DURATION_SEC * totalSlides;

  // Create unique keyframes name for each column
  const animationName = `slide-down-col-${offsetIndex}-${totalSlides}`;
  const keyframes = `
    @keyframes ${animationName} {
      0% { transform: translateY(0); }
      100% { transform: translateY(-${animationDistance}rem); }
    }
  `;

  return (
    <div
      className={`relative flex flex-col h-full min-h-[${VISIBLE_SLIDES * slideSizeRem}rem] justify-center w-fit overflow-hidden`}
      style={{
        height: `calc(${VISIBLE_SLIDES} * ${slideSizeRem}rem)`,
        minHeight: `${VISIBLE_SLIDES * slideSizeRem}rem`,
      }}
    >
      <style>{keyframes}</style>
      <div
        className="flex flex-col gap-5"
        style={{
          animation: `${animationName} ${totalDuration}s linear infinite`,
          animationDelay: `${animationDelay}s`,
          willChange: "transform",
        }}
      >
        {displayList.map((v, idx) => (
          <VideoGridThumb
            key={`carousel-videos-${offsetIndex}-${v.id}-${idx}`}
            thumbnail={v.thumbnail}
            className=""
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Animated grid where ALL columns are animated carousels!
 */
export function AnimatedVideoGridRows({ }: { staticRows?: boolean }) {
  // Pull enough videos for all carousels
  const { videos } = useVideoGridData(TOTAL_CYCLE_VIDEOS);

  const fallbackThumbs = Array(GRID_COLS * VISIBLE_SLIDES)
    .fill("/placeholder.svg")
    .map((t, i) => ({ id: "fake-" + i, thumbnail: t }));

  const videoPool = videos.length > 0
    ? videos.slice(0, TOTAL_CYCLE_VIDEOS)
    : fallbackThumbs.slice(0, TOTAL_CYCLE_VIDEOS);

  // For visual difference: stagger each column's offset and speed
  const offsets = [0, 7, 14, 21]; // Spread starting point across the pool for each column
  const delays = [0, 2, 4, 6]; // Stagger animation start so not all sync
  const speeds = [1, 1.1, 0.96, 1.08]; // Subtle speed variations for visual interest

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      style={{
        zIndex: 1,
      }}
    >
      <div className="flex flex-row gap-5">
        {offsets.map((offset, colIdx) => (
          <CarouselColumn
            key={colIdx}
            videoList={videoPool}
            visibleSlides={VISIBLE_SLIDES}
            offsetIndex={offset}
            animationDelay={delays[colIdx]}
            speed={speeds[colIdx]}
          />
        ))}
      </div>
    </div>
  );
}

