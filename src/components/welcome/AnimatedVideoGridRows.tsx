import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { useRef } from "react";

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
      className={`rounded-md bg-white aspect-[16/11] w-40 md:w-56 lg:w-60 shadow-none ${className}`}
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
const VISIBLE_SLIDES = 4; // number of videos visible at a time in the vertical column
const SLIDE_HEIGHT_REM = 7.5; // match to w-40 aspect
const GAP_REM = 2; // gap-8 ~2rem
const TOTAL_CYCLE_VIDEOS = 30; // How many videos to use for the main carousel (enough for real scrolling)

/**
 * CarouselColumn: Seamlessly vertical scrolling through ALL videos provided, one-by-one, always showing 4 at a time.
 */
function CarouselColumn({
  videoList,
  visibleSlides = VISIBLE_SLIDES,
}: {
  videoList: Array<{ id: string; thumbnail: string }>;
  visibleSlides?: number;
}) {
  // Double the list to ensure a smooth seamless loop
  const displayList =
    videoList.length > 0
      ? [...videoList, ...videoList.slice(0, visibleSlides)]
      : Array(visibleSlides).fill({ id: "fake", thumbnail: "/placeholder.svg" });

  // Calculate the total height of one slide
  const slideSizeRem = SLIDE_HEIGHT_REM + GAP_REM;
  const totalSlides = displayList.length;
  const animationDistance = slideSizeRem * totalSlides;

  // Slower speed per slide for smooth effect:
  const SLIDE_DURATION_SEC = 6; // seconds to show each slide before it moves down by one
  const totalDuration = (SLIDE_DURATION_SEC * totalSlides);

  // Generate keyframes for smooth endless downward scroll
  const animationName = `slide-down-all-videos-${totalSlides}`;
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
        className="flex flex-col gap-8"
        style={{
          animation: `${animationName} ${totalDuration}s linear infinite`,
          willChange: "transform",
        }}
      >
        {displayList.map((v, idx) => (
          <VideoGridThumb
            key={`carousel-all-videos-${v.id}-${idx}`}
            thumbnail={v.thumbnail}
            className=""
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Video grid with animated 1st column (vertical carousel showing all videos)
 */
export function AnimatedVideoGridRows({ staticRows = false }: { staticRows?: boolean }) {
  // Pull enough videos for full carousel effect
  // Note: If there aren't enough, will fill with placeholders!
  const { videos } = useVideoGridData(TOTAL_CYCLE_VIDEOS + GRID_ROWS * GRID_COLS);

  // Always fill to at least what we need for non-carousel grid, then extras for the carousel
  const fallbackThumbs = Array(GRID_COLS * GRID_ROWS)
    .fill("/placeholder.svg")
    .map((t, i) => ({ id: "fake-" + i, thumbnail: t }));

  // Pad to fill the whole grid (20) if not enough
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

  // Prepare vertical carousel list: Use all available videos for smooth scroll
  // Limit for performance and smoothness if there are *lots* of videos
  const carouselVideos =
    videos.length > 0
      ? videos.slice(0, TOTAL_CYCLE_VIDEOS)
      : fallbackThumbs.slice(0, TOTAL_CYCLE_VIDEOS);

  // The rest (static, non-carousel columns): columns 2-5, per row
  const rowDatas: Array<Array<{ id: string; thumbnail: string }>> = [];
  for (let i = 0; i < GRID_ROWS; i++) {
    const start = i * GRID_COLS;
    rowDatas.push(fullVideos.slice(start, start + GRID_COLS));
  }
  const staticCols = rowDatas.map((row) => row.slice(1, GRID_COLS)); // [row][col]

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      style={{
        zIndex: 1,
      }}
    >
      <div className="flex flex-row gap-8">
        {/* Animated vertical carousel as the first column */}
        <CarouselColumn videoList={carouselVideos} visibleSlides={VISIBLE_SLIDES} />

        {/* Rest of the grid - 4 rows, each 4 (not carousel) */}
        <div className="flex flex-col gap-8">
          {staticCols.map((row, rowIdx) => (
            <div
              key={rowIdx + 1}
              className="flex flex-row gap-8 justify-center"
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
