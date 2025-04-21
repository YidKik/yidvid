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

const GRID_ROWS = 4;
const GRID_COLS = 5;
const VISIBLE_SLIDES = 4; // Number of videos visible at a time in the vertical columns
const SLIDE_HEIGHT_REM = 5.5; // Reduced height for more compact look (was 7.5)
const GAP_REM = 1.25; // Smaller gap for compactness (was 2)
const TOTAL_CYCLE_VIDEOS = 30; // How many unique videos per carousel column (enough for smooth scroll)

/**
 * Vertical CarouselColumn: Seamless vertical scroll of N videos.
 * offsetIndex: start index in the videos list to ensure each column shows a unique sequence.
 */
function CarouselColumn({
  videoList,
  visibleSlides = VISIBLE_SLIDES,
  offsetIndex = 0,
  animationDelay = 0,
}: {
  videoList: Array<{ id: string; thumbnail: string }>;
  visibleSlides?: number;
  offsetIndex?: number;
  animationDelay?: number;
}) {
  // Create an offset (cycled) display list for this column
  const displayList = useMemo(() => {
    if (videoList.length === 0) {
      return Array(visibleSlides).fill({ id: "fake", thumbnail: "/placeholder.svg" });
    }
    // Cycle offset
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

  // Animation duration: slower for smooth feel
  const SLIDE_DURATION_SEC = 6; // seconds per slide
  const totalDuration = SLIDE_DURATION_SEC * totalSlides;

  // Create unique keyframes name for each column to allow for offset animation delays
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
 * Video grid with animated first TWO columns (vertical carousels showing all videos, with offset)
 */
export function AnimatedVideoGridRows({ staticRows = false }: { staticRows?: boolean }) {
  // Pull enough videos for both carousels + static grid
  const { videos } = useVideoGridData(TOTAL_CYCLE_VIDEOS + GRID_ROWS * GRID_COLS);

  const fallbackThumbs = Array(GRID_COLS * GRID_ROWS)
    .fill("/placeholder.svg")
    .map((t, i) => ({ id: "fake-" + i, thumbnail: t }));

  // Pad if needed
  const fullVideos = [
    ...videos,
    ...(videos.length < GRID_ROWS * GRID_COLS
      ? Array(GRID_ROWS * GRID_COLS - videos.length)
          .fill(0)
          .map((_, i) => ({
            id: "extra" + i,
            thumbnail: "/placeholder.svg",
          }))
      : []),
  ];

  // Carousels: each column gets a different start point in the list
  const carouselVideos = videos.length > 0
    ? videos.slice(0, TOTAL_CYCLE_VIDEOS)
    : fallbackThumbs.slice(0, TOTAL_CYCLE_VIDEOS);

  // The two animated columns
  const col1Offset = 0;
  const col2Offset = Math.floor(carouselVideos.length / 2); // Halfway through for uniqueness

  // The rest (static, non-carousel columns): columns 3-5, per row
  const rowDatas: Array<Array<{ id: string; thumbnail: string }>> = [];
  for (let i = 0; i < GRID_ROWS; i++) {
    const start = i * GRID_COLS;
    rowDatas.push(fullVideos.slice(start, start + GRID_COLS));
  }
  // We'll only render columns 3-5 of each row
  const staticCols = rowDatas.map((row) => row.slice(2, GRID_COLS)); // [row][col]

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      style={{
        zIndex: 1,
      }}
    >
      <div className="flex flex-row gap-5">
        {/* Animated vertical carousels: columns 1 and 2 */}
        <CarouselColumn videoList={carouselVideos} visibleSlides={VISIBLE_SLIDES} offsetIndex={col1Offset} animationDelay={0} />
        <CarouselColumn videoList={carouselVideos} visibleSlides={VISIBLE_SLIDES} offsetIndex={col2Offset} animationDelay={3} />

        {/* Rest of the grid: 4 rows, each 3 (not animated) */}
        <div className="flex flex-col gap-5">
          {staticCols.map((row, rowIdx) => (
            <div
              key={rowIdx + 1}
              className="flex flex-row gap-5 justify-center"
            >
              {row.map((v, colIdx) => (
                <VideoGridThumb
                  key={v.id + "-" + colIdx}
                  thumbnail={v.thumbnail}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
