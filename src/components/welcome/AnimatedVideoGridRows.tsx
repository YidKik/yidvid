import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { useEffect, useRef, useState } from "react";

/**
 * Single video thumbnail for grid (scaled up)
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
      className={`rounded-md bg-white aspect-[16/11] w-72 md:w-96 lg:w-[25rem] shadow-none scale-[1.09] ${className}`}
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
const CAROUSEL_ANIMATION_INTERVAL = 2500;
const SLIDE_ANIMATION_DURATION = 430;

/**
 * CarouselColumn: Vertically sliding 4 video thumbs, cycling through a video array.
 */
function CarouselColumn({
  videoList,
  rowCount = GRID_ROWS,
  animationInterval = CAROUSEL_ANIMATION_INTERVAL,
}: {
  videoList: Array<{id: string; thumbnail: string}>,
  rowCount?: number;
  animationInterval?: number;
}) {
  const [pointer, setPointer] = useState(0);
  const [sliding, setSliding] = useState(false);
  const timeoutRef = useRef<any>(null);

  // Compute which videos should be present in the carousel stack right now
  const windowIndex = pointer;
  const total = videoList.length;
  const window = Array(rowCount)
    .fill(0)
    .map((_, i) => videoList[(windowIndex + i) % total]);

  // Previous window for animation
  const [prevWindow, setPrevWindow] = useState(window);
  const [currentWindow, setCurrentWindow] = useState(window);
  const [animating, setAnimating] = useState(false);

  // Animation loop
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setAnimating(true);
      setTimeout(() => {
        setPointer((p) => (p + 1) % total);
        setAnimating(false);
      }, SLIDE_ANIMATION_DURATION);
    }, animationInterval);

    return () => clearTimeout(timeoutRef.current);
  }, [pointer, total, animationInterval]);

  // Sync prev/current window for animation
  useEffect(() => {
    if (!animating) {
      setPrevWindow(currentWindow);
      setCurrentWindow(
        Array(rowCount)
          .fill(0)
          .map((_, i) => videoList[(pointer + i) % total])
      );
    }
  }, [pointer, animating, rowCount, videoList]);

  return (
    <div className="relative flex flex-col h-full min-h-[41rem] justify-center w-fit">
      {/* Animate previous window: slides *down* */}
      <div
        className={`
          absolute left-0 w-full flex flex-col gap-8 top-0 transition-transform duration-400 pointer-events-none
          ${animating ? "animate-slide-down-carousel" : "opacity-0"}
        `}
        style={{
          zIndex: animating ? 10 : 1,
        }}
      >
        {prevWindow.map((v, i) => (
          <VideoGridThumb
            key={"prev-c-" + v.id + i}
            thumbnail={v.thumbnail}
            className="duration-300"
          />
        ))}
      </div>
      {/* New window, slides in from above */}
      <div
        className={`relative flex flex-col gap-8 w-full transition-transform duration-400 ${animating ? "animate-slide-in-carousel" : ""}`}
        style={{zIndex: 20}}
      >
        {currentWindow.map((v, i) => (
          <VideoGridThumb
            key={"curr-c-" + v.id + i}
            thumbnail={v.thumbnail}
            className="duration-300"
          />
        ))}
      </div>
      {/* Carousel-specific animations */}
      <style>{`
        @keyframes slideDownCarousel {
          0% { opacity: 1; transform: translateY(0);}
          90% { opacity: 0.15; }
          100% { opacity:0; transform: translateY(125%);}
        }
        .animate-slide-down-carousel {
          animation: slideDownCarousel ${SLIDE_ANIMATION_DURATION/1000}s cubic-bezier(.44,0,.72,1) forwards;
        }
        @keyframes slideInCarousel {
          0% { opacity: 0; transform: translateY(-115%) scale(0.97);}
          50% { opacity: 0.08;}
          98% {opacity:0.95;}
          100% { opacity: 1; transform: translateY(0) scale(1);}
        }
        .animate-slide-in-carousel {
          animation: slideInCarousel ${SLIDE_ANIMATION_DURATION/1000}s cubic-bezier(.44,0,.72,1) forwards;
        }
      `}</style>
    </div>
  );
}

/**
 * Video grid with animated 1st column (vertical carousel)
 */
export function AnimatedVideoGridRows({ staticRows = false }: { staticRows?: boolean }) {
  // Grab enough videos, default fallback if missing
  const { videos, loading } = useVideoGridData(GRID_ROWS * GRID_COLS);
  const fallbackThumbs = Array(GRID_COLS * GRID_ROWS)
    .fill("/placeholder.svg")
    .map((t, i) => ({ id: "fake-" + i, thumbnail: t }));

  // If not enough: always fill up with placeholders
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

  // Derive grid: each "row" is GRID_COLS, but first col in each row becomes the top to bottom carousel
  const rowDatas: Array<Array<{ id: string; thumbnail: string }>> = [];
  for (let i = 0; i < GRID_ROWS; i++) {
    const start = i * GRID_COLS;
    rowDatas.push(fullVideos.slice(start, start + GRID_COLS));
  }

  // For 1st column carousel: select 1st video from each row and build a cycling list (to make it seamless, cycle through the same video ids in order).
  const carouselColVideos = rowDatas.map((row) => row[0]);

  // The rest (static, non-carousel columns): columns 2-5, per row
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
        <CarouselColumn videoList={carouselColVideos} rowCount={GRID_ROWS} />
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
