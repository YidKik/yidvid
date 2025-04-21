
import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { useEffect, useRef, useState } from "react";

/**
 * Single video thumbnail for grid
 */
function VideoGridThumb({
  thumbnail,
}: {
  thumbnail: string;
}) {
  return (
    <div
      className="rounded-md bg-white aspect-[16/11] w-60 md:w-80 lg:w-[22rem] shadow-none" // Larger, more square, no outline
      style={{
        overflow: "hidden",
        background: "#fff",
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

const ANIMATED_ROW_SIZE = 4;
const GRID_COLS = 5;

/**
 * Sliding row implementation for top row: cycles through grid videos 4 at a time, sliding down
 */
function SlidingVideoRow({ videos, intervalMs = 2700 }: { videos: Array<{ id: string; thumbnail: string }>; intervalMs?: number }) {
  const [pointer, setPointer] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const timeoutRef = useRef<any>(null);

  // Compute group sets (loop through the videos array).
  const total = videos.length;
  const makeWindow = (start: number) => {
    if (total <= ANIMATED_ROW_SIZE) return videos;
    return Array(ANIMATED_ROW_SIZE)
      .fill(0)
      .map((_, i) => videos[(start + i) % total]);
  };

  // Track prevWindow for animation
  const [prevWindow, setPrevWindow] = useState(makeWindow(0));
  const [currentWindow, setCurrentWindow] = useState(makeWindow(0));
  const [animDir, setAnimDir] = useState<"down" | "none">("none");

  useEffect(() => {
    // Set interval for loop
    timeoutRef.current = setTimeout(() => {
      setAnimDir("down");
      setTimeout(() => {
        setPointer((p) => (p + ANIMATED_ROW_SIZE) % total);
        setAnimDir("none");
      }, 430); // animation duration
    }, intervalMs);

    return () => clearTimeout(timeoutRef.current);
  }, [pointer, total, intervalMs]);

  // When pointer updates, set new windows
  useEffect(() => {
    setPrevWindow(currentWindow);
    setCurrentWindow(makeWindow(pointer));
  }, [pointer]);

  return (
    <div
      className="relative h-[7.7rem] md:h-[10.5rem] lg:h-[12.2rem] overflow-visible flex justify-center"
      style={{ minWidth: "min(90vw,1060px)" }}
    >
      {/* The animated old row (slides out down) */}
      <div
        className={`
          absolute left-1/2 -translate-x-1/2 flex gap-8 top-0 w-full transition-transform duration-400 pointer-events-none
          ${animDir === "down" ? "animate-slide-down-row" : "opacity-0"}
        `}
        style={{
          zIndex: animDir === "down" ? 2 : 0,
        }}
      >
        {prevWindow.map((v, i) => (
          <div key={"prev-" + v.id + i} className="transition-transform duration-400">
            <VideoGridThumb thumbnail={v.thumbnail} />
          </div>
        ))}
      </div>
      {/* The new row (slides in from above) */}
      <div
        className={`
          relative flex gap-8 transition-transform duration-400 w-full
          ${animDir === "down" ? "animate-slide-in-row" : ""}
        `}
        style={{
          zIndex: 5,
        }}
      >
        {currentWindow.map((v, i) => (
          <div key={"curr-" + v.id + i} className="transition-transform duration-400">
            <VideoGridThumb thumbnail={v.thumbnail} />
          </div>
        ))}
      </div>
      {/* Add animations via custom CSS below */}
      <style>{`
      @keyframes slideDownRow {
        0% { opacity: 1; transform: translateY(0);}
        85% { opacity: 0.11; }
        100% { opacity:0; transform: translateY(130%);}
      }
      .animate-slide-down-row {
        animation: slideDownRow 0.43s cubic-bezier(.44,0,.72,1) forwards;
      }
      @keyframes slideInRow {
        0% { opacity: 0; transform: translateY(-110%) scale(0.96);}
        60% { opacity: 0.07;}
        98% {opacity:0.91;}
        100% { opacity: 1; transform: translateY(0) scale(1);}
      }
      .animate-slide-in-row {
        animation: slideInRow 0.43s cubic-bezier(.44,0,.72,1) forwards;
      }
      `}</style>
    </div>
  );
}

/**
 * Video grid with animated 1st row; all videos larger, less rounded, more square, not rotated.
 */
export function AnimatedVideoGridRows({ staticRows = false }: { staticRows?: boolean }) {
  // Grab 20+ videos (fallback to placeholder if missing)
  const { videos, loading } = useVideoGridData(20);
  const fallbackThumbs = Array(GRID_COLS)
    .fill("/placeholder.svg")
    .map((t, i) => ({ id: "fake-" + i, thumbnail: t }));

  // If not enough videos, fill up
  const fullVideos = [
    ...videos,
    ...(videos.length < 20 ? Array(20 - videos.length).fill(0).map((_, i) => ({
      id: "extra" + i,
      thumbnail: "/placeholder.svg"
    })) : [])
  ];

  // For 4 rows, first is animated sliding carousel, rest are static and aligned.
  const rowDatas: Array<Array<{ id: string; thumbnail: string }>> = [];
  for (let i = 0; i < 4; i++) {
    const start = i * GRID_COLS;
    rowDatas.push(fullVideos.slice(start, start + GRID_COLS));
  }

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      style={{
        zIndex: 1,
      }}
    >
      <div
        className="flex flex-col gap-8"
        style={{
          transform: "rotate(2.5deg)", // Just a touch, barely visible
        }}
      >
        {/* Animated top row */}
        <SlidingVideoRow videos={rowDatas[0]} />
        {/* Rest rows static */}
        {rowDatas.slice(1).map((row, rowIdx) => (
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
  );
}
